import { StorageManager, GoogleStorageService, DropboxStorageService } from '../../services/storageService';
import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { Dropbox } from 'dropbox';
import fs from 'fs';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    media: {
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  })),
}));

jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn(),
    },
    drive: jest.fn(),
  },
}));

jest.mock('dropbox', () => ({
  Dropbox: jest.fn(),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createReadStream: jest.fn(),
}));

describe('Storage Services', () => {
  let prisma: PrismaClient;
  let googleDriveMock: any;
  let dropboxMock: any;

  beforeAll(() => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'test';
    process.env.DROPBOX_ACCESS_TOKEN = 'test';
  });

  beforeEach(() => {
    prisma = new PrismaClient();
    googleDriveMock = {
      files: {
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        list: jest.fn(),
      },
    };
    (google.drive as jest.Mock).mockReturnValue(googleDriveMock);

    dropboxMock = {
      filesUpload: jest.fn(),
      filesDeleteV2: jest.fn(),
      sharingCreateSharedLinkWithSettings: jest.fn(),
    };
    (Dropbox as jest.Mock).mockImplementation(() => dropboxMock);
  });

  describe('GoogleStorageService', () => {
    it('should upload a file', async () => {
      const service = new GoogleStorageService(prisma);
      const file = { originalname: 'test.txt', mimetype: 'text/plain', path: '/tmp/test.txt' };
      googleDriveMock.files.list.mockResolvedValue({ data: { files: [] } });
      googleDriveMock.files.create.mockResolvedValueOnce({ data: { id: 'folder-id' } });
      googleDriveMock.files.create.mockResolvedValueOnce({ data: { id: 'google-id', webViewLink: 'http://google.com' } });
      await service.upload(file, 'user-id', 'GOOGLE_DRIVE');
      expect(googleDriveMock.files.create).toHaveBeenCalled();
      expect(prisma.media.create).toHaveBeenCalledWith({
        data: {
          provider: 'GOOGLE_DRIVE',
          providerId: 'google-id',
          url: 'http://google.com',
        },
      });
    });
  });

  describe('DropboxStorageService', () => {
    it('should upload a file', async () => {
      const service = new DropboxStorageService(prisma);
      const file = { originalname: 'test.txt', mimetype: 'text/plain', path: '/tmp/test.txt' };
      dropboxMock.filesUpload.mockResolvedValue({ result: { id: 'dropbox-id', path_display: '/uploads/user-id/test.txt' } });
      dropboxMock.sharingCreateSharedLinkWithSettings.mockResolvedValue({ url: 'http://dropbox.com?dl=0' });
      await service.upload(file, 'user-id', 'DROPBOX');
      expect(dropboxMock.filesUpload).toHaveBeenCalled();
      expect(prisma.media.create).toHaveBeenCalledWith({
        data: {
          provider: 'DROPBOX',
          providerId: 'dropbox-id',
          url: 'http://dropbox.com?raw=1',
        },
      });
    });
  });

  describe('StorageManager', () => {
    it('should use fallback on primary failure', async () => {
      const primary = new GoogleStorageService(prisma);
      const fallback = new DropboxStorageService(prisma);
      const manager = new StorageManager(primary, fallback);
      const file = { originalname: 'test.txt', mimetype: 'text/plain', path: '/tmp/test.txt' };

      googleDriveMock.files.list.mockResolvedValue({ data: { files: [] } });
      googleDriveMock.files.create.mockRejectedValue(new Error('Google Drive failed'));
      dropboxMock.filesUpload.mockResolvedValue({ result: { id: 'dropbox-id', path_display: '/uploads/user-id/test.txt' } });
      dropboxMock.sharingCreateSharedLinkWithSettings.mockResolvedValue({ url: 'http://dropbox.com?dl=0' });

      await manager.upload(file, 'user-id', 'GOOGLE_DRIVE');
      expect(googleDriveMock.files.create).toHaveBeenCalled();
      expect(dropboxMock.filesUpload).toHaveBeenCalled();
    });
  });
});
