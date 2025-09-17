import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismockClient } from 'prismock';
import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';

import { profilePictureHandler } from '../src/pages/api/user/profile-picture';
import { StorageService } from '../src/services/storageService';


// Mock services and libraries
jest.mock('../src/services/storageService');
const MockStorageService = StorageService as jest.MockedClass<typeof StorageService>;

const mockParse = jest.fn();
jest.mock('formidable', () => {
    return jest.fn().mockImplementation(() => {
        return { parse: mockParse };
    });
});


describe('/api/user', () => {
    let prismock: PrismockClient;
    let storageService: jest.Mocked<StorageService>;
    let testUser: User;
    let testUserToken: string;

    beforeAll(async () => {
        prismock = new PrismockClient() as unknown as PrismockClient;
        // @ts-ignore
        storageService = new MockStorageService();

        testUser = await prismock.user.create({
            data: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        });
        testUserToken = jwt.sign({ user: testUser }, 'your-jwt-secret');
    });

    beforeEach(() => {
        // Reset mocks before each test
        (storageService.upload as jest.Mock).mockClear();
        jest.clearAllMocks();
    });

    const makeReqRes = (method: 'POST' | 'GET', options: { headers?: any } = {}) => {
        const { req, res } = createMocks({
            method,
            headers: { Authorization: `Bearer ${testUserToken}`, 'Content-Type': 'multipart/form-data', ...options.headers },
        });
        return { req: req as NextApiRequest, res: res as NextApiResponse };
    };

    describe('/profile-picture', () => {
        it('should upload a profile picture and update the user record', async () => {
            const mockImageUrl = 'http://mock-storage.com/image.jpg';
            (storageService.upload as jest.Mock).mockResolvedValue(mockImageUrl);

            // Configure the mock 'parse' method to simulate a file upload
            mockParse.mockImplementation((req, callback) => {
                const mockFile = { filepath: 'mock-path', originalFilename: 'mock.jpg' };
                // formidable's callback is (err, fields, files)
                callback(null, {}, { profilePicture: [mockFile] });
            });

            const { req, res } = makeReqRes('POST');

            await profilePictureHandler(req, res, prismock, storageService);

            const updatedUser = await prismock.user.findUnique({ where: { id: testUser.id } });
            expect(updatedUser?.image).toBe(mockImageUrl);
            expect(storageService.upload).toHaveBeenCalledWith(expect.objectContaining({ filepath: 'mock-path' }), 'profile-pictures');
        });

        it('should return 401 for unauthenticated users', async () => {
            const { req, res } = createMocks({ method: 'POST' }); // No auth header
            await profilePictureHandler(req, res, prismock, storageService);
            expect(res._getStatusCode()).toBe(401);
        });
    });
});
