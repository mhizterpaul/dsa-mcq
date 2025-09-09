import { GoogleStorageService } from './googleStorageService';
import { DropboxStorageService } from './dropboxStorageService';
import { formidable } from 'formidable';

export interface IStorageService {
  upload(file: formidable.File | formidable.File[], userId: string): Promise<string>;
  delete(fileId: string): Promise<void>;
  update(fileId: string, file: any): Promise<void>;
}

class MockStorageService implements IStorageService {
    async upload(file: any, userId: string): Promise<string> {
        console.log(`Mock upload for user ${userId}`);
        return 'mock://path/to/file.jpg';
    }
    async delete(fileId: string): Promise<void> {
        console.log(`Mock delete for file ${fileId}`);
    }
    async update(fileId: string, file: any): Promise<void> {
        console.log(`Mock update for file ${fileId}`);
    }
}

export class StorageService implements IStorageService {
  private provider: IStorageService;

  constructor(provider: 'google' | 'dropbox' | 'mock' = 'google') {
    if (process.env.NODE_ENV === 'test') {
        this.provider = new MockStorageService();
    } else if (provider === 'google') {
      this.provider = new GoogleStorageService();
    } else {
      this.provider = new DropboxStorageService();
    }
  }

  async upload(file: formidable.File | formidable.File[], userId: string): Promise<string> {
    return this.provider.upload(file, userId);
  }

  async delete(fileId: string): Promise<void> {
    return this.provider.delete(fileId);
  }

  async update(fileId: string, file: any): Promise<void> {
    return this.provider.update(fileId, file);
  }
}
