import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { Dropbox } from 'dropbox';
import fs from 'fs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

interface StorageService {
  upload(file: any, userId: string, provider: 'GOOGLE_DRIVE' | 'DROPBOX'): Promise<string>;
  delete(fileId: string): Promise<void>;
  update(fileId: string, file: any): Promise<void>;
}

export class GoogleStorageService implements StorageService {
  private drive;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('Google Drive credentials are not configured.');
    }
    this.prisma = prisma;
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    this.drive = google.drive({ version: 'v3', auth });
  }

  private async getOrCreateUserFolder(userId: string): Promise<string> {
    const query = `name = '${userId}' and mimeType = 'application/vnd.google-apps.folder' and 'root' in parents`;
    const response = await this.drive.files.list({ q: query, fields: 'files(id)' });
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    } else {
      const fileMetadata = {
        name: userId,
        mimeType: 'application/vnd.google-apps.folder',
      };
      const folder = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });
      return folder.data.id!;
    }
  }

  async upload(file: any, userId: string, provider: 'GOOGLE_DRIVE' | 'DROPBOX'): Promise<string> {
    const userFolderId = await this.getOrCreateUserFolder(userId);
    const fileName = `${uuidv4()}-${file.originalname}`;
    const fileMetadata = {
      name: fileName,
      parents: [userFolderId],
    };
    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };
    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });
    const fileId = response.data.id!;
    const url = response.data.webViewLink!;

    await this.prisma.media.create({
      data: {
        provider,
        providerId: fileId,
        url,
      },
    });

    return url;
  }

  async delete(fileId: string): Promise<void> {
    const media = await this.prisma.media.findUnique({ where: { id: fileId } });
    if (!media) {
      throw new Error('Media not found');
    }
    await this.drive.files.delete({ fileId: media.providerId });
    await this.prisma.media.delete({ where: { id: fileId } });
  }

  async update(fileId: string, file: any): Promise<void> {
    const media = await this.prisma.media.findUnique({ where: { id: fileId } });
    if (!media) {
      throw new Error('Media not found');
    }
    const fileMetadata = {
      name: file.originalname,
    };
    const mediaBody = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };
    await this.drive.files.update({
      fileId: media.providerId,
      requestBody: fileMetadata,
      media: mediaBody,
    });
  }
}

export class DropboxStorageService implements StorageService {
  private dbx;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    if (!process.env.DROPBOX_ACCESS_TOKEN) {
      throw new Error('Dropbox access token is not configured.');
    }
    this.prisma = prisma;
    this.dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
  }

  async upload(file: any, userId: string, provider: 'GOOGLE_DRIVE' | 'DROPBOX'): Promise<string> {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const path = `/uploads/${userId}/${fileName}`;
    const response = await this.dbx.filesUpload({
      path,
      contents: fs.createReadStream(file.path),
    });
    const fileId = response.result.id;
    const { url } = await this.dbx.sharingCreateSharedLinkWithSettings({ path: response.result.path_display! });
    const directUrl = url.replace('dl=0', 'raw=1');


    await this.prisma.media.create({
      data: {
        provider,
        providerId: fileId,
        url: directUrl,
      },
    });

    return directUrl;
  }

  async delete(fileId: string): Promise<void> {
    const media = await this.prisma.media.findUnique({ where: { id: fileId } });
    if (!media) {
      throw new Error('Media not found');
    }
    await this.dbx.filesDeleteV2({ path: media.providerId });
    await this.prisma.media.delete({ where: { id: fileId } });
  }

  async update(fileId: string, file: any): Promise<void> {
    const media = await this.prisma.media.findUnique({ where: { id: fileId } });
    if (!media) {
      throw new Error('Media not found');
    }
    await this.dbx.filesUpload({
      path: media.providerId,
      contents: fs.createReadStream(file.path),
      mode: { '.tag': 'overwrite' },
    });
  }
}

export class StorageManager implements StorageService {
  private primary: StorageService;
  private fallback: StorageService;

  constructor(primary: StorageService, fallback: StorageService) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async upload(file: any, userId: string, provider: 'GOOGLE_DRIVE' | 'DROPBOX'): Promise<string> {
    try {
      return await this.primary.upload(file, userId, provider);
    } catch (error) {
      console.error('Primary storage service failed. Trying fallback.', error);
      return await this.fallback.upload(file, userId, provider);
    }
  }

  async delete(fileId: string): Promise<void> {
    // Deletion should be attempted on both services to ensure the file is removed
    // if it was uploaded to the fallback. A more robust implementation would
    // store the provider along with the fileId.
    try {
      await this.primary.delete(fileId);
    } catch (error) {
      console.error('Primary storage service failed to delete. Trying fallback.', error);
      await this.fallback.delete(fileId);
    }
  }

  async update(fileId: string, file: any): Promise<void> {
    try {
      await this.primary.update(fileId, file);
    } catch (error) {
      console.error('Primary storage service failed to update. Trying fallback.', error);
      await this.fallback.update(fileId, file);
    }
  }
}
