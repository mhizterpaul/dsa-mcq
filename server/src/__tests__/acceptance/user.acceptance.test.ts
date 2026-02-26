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
  isPremium: true,
  isVerified: false,
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

  describe('Authentication & Authorization', () => {
    test('rejects expired JWT', async () => {
        const expiredToken = jwt.sign(
            { user: { id: testUser.id }, sessionId },
            process.env.JWT_SECRET!,
            { expiresIn: '-1h' }
        );
        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${expiredToken}` },
        });
        await profileSummaryHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    test('rejects malformed JWT', async () => {
        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: 'Bearer malformed-token' },
        });
        await profileSummaryHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    test('rejects token with invalid sessionId', async () => {
        const invalidSessToken = jwt.sign(
            { user: { id: testUser.id }, sessionId: 'invalid-sess' },
            process.env.JWT_SECRET!
        );
        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${invalidSessToken}` },
        });
        await profileSummaryHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('GET /api/user/profile-summary', () => {
    test('returns user profile summary with all client-required fields', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `Bearer ${token}` },
      });

      await profileSummaryHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.user).toMatchObject({
          id: testUser.id,
          fullName: testUser.fullName,
          email: testUser.email,
          image: testUser.image,
          level: testUser.level,
          achievementsCount: testUser.achievementsCount,
          weeklyGiftsCount: testUser.weeklyGiftsCount,
          xp: testEngagement.xp,
          isPremium: testUser.isPremium,
          isVerified: testUser.isVerified,
      });
    });

    test('returns 405 for invalid methods', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
        });
        await profileSummaryHandler(req, res);
        expect(res._getStatusCode()).toBe(405);
    });
  });

  describe('PUT /api/user/profile', () => {
    test('updates user preferences, metadata, and email', async () => {
      const newPreferences = { theme: 'light', notifications: true };
      const newMetadata = { lastLogin: '2023-02-01', device: 'iPhone' };

      const { req, res } = createMocks({
        method: 'PUT',
        headers: { authorization: `Bearer ${token}` },
        body: {
            fullName: 'New Name',
            email: 'newemail@example.com',
            preferences: newPreferences,
            metadata: newMetadata
        }
      });

      await profileHandler(req, res);

      expect(res._getStatusCode()).toBe(200);

      const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
      expect(updatedUser?.fullName).toBe('New Name');
      expect(updatedUser?.email).toBe('newemail@example.com');
      expect(JSON.parse(updatedUser?.preferences || '{}')).toEqual(newPreferences);
      expect(JSON.parse(updatedUser?.metadata || '{}')).toEqual(newMetadata);
    });

    test('handles partial updates', async () => {
        const { req, res } = createMocks({
            method: 'PUT',
            headers: { authorization: `Bearer ${token}` },
            body: { fullName: 'Partial Name Update' }
        });
        await profileHandler(req, res);
        expect(res._getStatusCode()).toBe(200);
        const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
        expect(updatedUser?.fullName).toBe('Partial Name Update');
        expect(updatedUser?.email).toBe(testUser.email); // Unchanged
    });
  });

  describe('POST /api/user/profile-picture', () => {
    test('updates user profile picture', async () => {
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

    test('returns 400 for missing file', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
            body: {}
        });
        await profilePictureHandler(req, res);
        expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('POST /api/user/settings', () => {
    test('updates settings and validates persistence', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
            body: { quizTitle: 'New Quiz Title' }
        });

        await settingsHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({ success: true });
    });

    test('returns 400 for invalid setting value type', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
            body: { quizTitle: 123 }
        });
        await settingsHandler(req, res);
        expect(res._getStatusCode()).toBe(400);
    });
  });
});
