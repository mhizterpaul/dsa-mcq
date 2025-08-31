import { PrismaClient } from '@prisma/client';
import { Dropbox } from 'dropbox';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService } from './storageService';

export class DropboxStorageService implements IStorageService {
  public readonly name = 'dropbox';
  private dbx;
  private prisma: PrismaClient;

  constructor() {
    if (!process.env.DROPBOX_ACCESS_TOKEN) {
      throw new Error('Dropbox access token is not configured.');
    }
    this.prisma = new PrismaClient();
    this.dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
  }

  async upload(file: any, userId: string, provider: 'google' | 'dropbox'): Promise<string> {
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
