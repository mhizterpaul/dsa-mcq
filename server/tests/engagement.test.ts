import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { engagementService } from '../src/services/engagementService';
import { schedulerService } from '../src/services/schedulerService';
import actionHandler from '../src/pages/api/engagement/action';
import leaderboardHandler from '../src/pages/api/engagement/leaderboard';
import weeklyKingHandler from '../src/pages/api/engagement/weekly-king';
import settingsHandler from '../src/pages/api/engagement/settings';

const prisma = new PrismaClient();

// Helper function to create an authenticated user
async function createAuthenticatedUser(email = 'testuser@example.com', password = 'TestPassword123!') {
  const user = await prisma.user.create({ data: { email, password } });
  const accessToken = jwt.sign({ user }, 'your-jwt-secret');
  return { user, accessToken };
}

describe('/api/engagement', () => {
    beforeAll(() => {
        schedulerService.start();
    });

    beforeEach(async () => {
        await prisma.engagement.deleteMany({});
        await prisma.leaderboard.deleteMany({});
        await prisma.user.deleteMany({});
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('/action', () => {
        it('should update user XP', async () => {
            const { user, accessToken } = await createAuthenticatedUser();
            const { req, res } = createMocks({
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
                body: { xp: 50 },
            });
            await actionHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
        });

        it('should return 401 for unauthenticated users', async () => {
            const { req, res } = createMocks({ method: 'POST', body: { xp: 50 } });
            await actionHandler(req, res);
            expect(res._getStatusCode()).toBe(401);
        });
    });

    describe('/leaderboard', () => {
        it('should return a ranked list of users', async () => {
            const user1 = await createAuthenticatedUser('user1@test.com');
            await engagementService.updateUserXP(user1.user.id, 100);
            const user2 = await createAuthenticatedUser('user2@test.com');
            await engagementService.updateUserXP(user2.user.id, 50);

            const { req, res } = createMocks({ method: 'GET' });
            await leaderboardHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
        });
    });

    describe('/weekly-king', () => {
        it('should return the user with the highest weekly XP', async () => {
            const user1 = await createAuthenticatedUser('user1@test.com');
            await engagementService.updateUserXP(user1.user.id, 100);

            const { req, res } = createMocks({ method: 'GET' });
            await weeklyKingHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
        });
    });

    describe('/settings', () => {
        it('should update global settings', async () => {
            const { accessToken } = await createAuthenticatedUser();
            const { req, res } = createMocks({
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
                body: { quizTitle: 'New Title' },
            });
            await settingsHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
        });

        it('should return 401 for unauthenticated users', async () => {
            const { req, res } = createMocks({ method: 'POST', body: { quizTitle: 'New Title' } });
            await settingsHandler(req, res);
            expect(res._getStatusCode()).toBe(401);
        });
    });
});
