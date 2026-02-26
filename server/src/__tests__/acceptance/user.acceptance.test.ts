process.env.DATABASE_URL = "file:./test.db";
process.env.JWT_SECRET = 'test-secret';
process.env.USE_REAL_DB = 'true';

import { createMocks } from 'node-mocks-http';
import profileSummaryHandler from '../../pages/api/user/profile-summary';
import profileHandler from '../../pages/api/user/profile';
import profilePictureHandler from '../../pages/api/user/profile-picture';
import settingsHandler from '../../pages/api/user/settings';
import { prisma } from '../../infra/prisma/client';
import { StorageService } from '../../infra/storageService';
import jwt from 'jsonwebtoken';

const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  fullName: 'Test User FullName',
  role: 'USER',
  level: 5,
  achievementsCount: 10,
  weeklyGiftsCount: 3,
  image: 'https://example.com/avatar.png',
};

const testEngagement = {
  xp: 1500,
};

describe('User Acceptance Tests (Real DB)', () => {
  let token: string;
  let sessionId: string;

  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.engagement.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
        data: {
            ...testUser,
            engagement: {
                create: testEngagement
            }
        }
    });

    const session = await prisma.session.create({
        data: {
            userId: user.id,
            expires: new Date(Date.now() + 3600000),
            sessionToken: 'test-session-token'
        }
    });

    sessionId = session.id;
    token = jwt.sign({ user: { id: user.id }, sessionId: session.id }, process.env.JWT_SECRET!);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/user/profile-summary', () => {
    test('returns user profile summary correctly', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `Bearer ${token}` },
      });

      await profileSummaryHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(testUser.id);
      expect(data.user.fullName).toBe(testUser.fullName);
      expect(data.user.xp).toBe(testEngagement.xp);
      expect(data.user.level).toBe(testUser.level);
    });

    test('returns 401 if unauthorized', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await profileSummaryHandler(req, res);
      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('PUT /api/user/profile', () => {
    test('updates user preferences and metadata', async () => {
      const newPreferences = { theme: 'light' };
      const newMetadata = { lastLogin: '2023-02-01' };

      const { req, res } = createMocks({
        method: 'PUT',
        headers: { authorization: `Bearer ${token}` },
        body: {
            fullName: 'New Name',
            preferences: newPreferences,
            metadata: newMetadata
        }
      });

      await profileHandler(req, res);

      expect(res._getStatusCode()).toBe(200);

      const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
      expect(updatedUser?.fullName).toBe('New Name');
      expect(JSON.parse(updatedUser?.preferences || '{}')).toEqual(newPreferences);
      expect(JSON.parse(updatedUser?.metadata || '{}')).toEqual(newMetadata);
    });
  });

  describe('POST /api/user/profile-picture', () => {
    test('updates user profile picture', async () => {
        // Mock StorageService upload
        const uploadMock = jest.spyOn(StorageService.prototype, 'upload').mockResolvedValue('https://example.com/new-avatar.png');

        const { req, res } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
            body: { file: 'base64data' }
        });

        await profilePictureHandler(req, res);

        expect(res._getStatusCode()).toBe(200);

        const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
        expect(updatedUser?.image).toBe('https://example.com/new-avatar.png');

        uploadMock.mockRestore();
    });
  });

  describe('POST /api/user/settings', () => {
    test('updates global settings (legacy logic moved to user route)', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
            body: { quizTitle: 'New Quiz Title' }
        });

        await settingsHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({ success: true });
    });
  });
});
