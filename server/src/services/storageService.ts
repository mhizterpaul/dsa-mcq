import { PrismaClient } from '@prisma/client';
import { GoogleStorageService } from './googleStorageService';
import { DropboxStorageService } from './dropboxStorageService';

export interface IStorageService {
  name: 'google' | 'dropbox';
  upload(file: any, userId: string, provider: 'google' | 'dropbox'): Promise<string>;
  delete(fileId: string): Promise<void>;
  update(fileId: string, file: any): Promise<void>;
}

class StorageService implements IStorageService {
  private provider: IStorageService;
  private providerType: 'google' | 'dropbox';

  constructor(provider: 'google' | 'dropbox' = 'google') {
    this.providerType = provider;
    this.provider = this.createProvider(provider);
  }

  private createProvider(provider: 'google' | 'dropbox'): IStorageService {
    if (provider === 'google') {
      return new GoogleStorageService();
    } else {
      return new DropboxStorageService();
    }
  }

  getProvider(): string {
    return this.provider.name;
  }

  setProvider(provider: 'google' | 'dropbox') {
    this.providerType = provider;
    this.provider = this.createProvider(provider);
  }

  async upload(file: any, userId: string): Promise<string> {
    return this.provider.upload(file, userId, this.providerType);
  }

  async delete(fileId: string): Promise<void> {
    return this.provider.delete(fileId);
  }

  async update(fileId: string, file: any): Promise<void> {
    return this.provider.update(fileId, file);
  }
}

export const storageService = new StorageService();
