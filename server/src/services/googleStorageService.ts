import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService } from './storageService';

export class GoogleStorageService implements IStorageService {
  public readonly name = 'google';
  private drive;
  private prisma: PrismaClient;

  constructor() {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('Google Drive credentials are not configured.');
    }
    this.prisma = new PrismaClient();
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

  async upload(file: any, userId: string, provider: 'google' | 'dropbox'): Promise<string> {
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
