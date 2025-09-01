import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { quizService } from '../src/services/quizService';
import sessionsHandler from '../src/pages/api/daily-quiz/sessions';

const prisma = new PrismaClient();

// Helper function to create an authenticated user
async function createAuthenticatedUser(email: string, xp: number) {
  const user = await prisma.user.create({ data: { email } });
  await prisma.engagement.create({ data: { userId: user.id, xp, xp_weekly: xp, xp_monthly: xp } });
  const accessToken = jwt.sign({ user }, 'your-jwt-secret');
  return { user, accessToken };
}

describe('/api/daily-quiz', () => {
    beforeEach(async () => {
        await prisma.engagement.deleteMany({});
        await prisma.leaderboard.deleteMany({});
        await prisma.user.deleteMany({});
        quizService.reset();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('/sessions', () => {
        it('should create a new session if none exist', async () => {
            const { user, accessToken } = await createAuthenticatedUser('user1@test.com', 100);
            const { req, res } = createMocks({
                method: 'GET',
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            await sessionsHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());
            expect(data.participants).toHaveLength(1);
            expect(data.participants[0].id).toBe(user.id);
        });

        it('should add a user to the most similar session', async () => {
            // Create session 1 with a high-XP user
            const user1 = await createAuthenticatedUser('user1@test.com', 1000);
            await quizService.findOrCreateSessionForUser(user1.user);

            // Create session 2 with a low-XP user
            const user2 = await createAuthenticatedUser('user2@test.com', 10);
            await quizService.findOrCreateSessionForUser(user2.user);

            // Create a new high-XP user
            const newUser = await createAuthenticatedUser('newuser@test.com', 900);

            // This new user should be matched with session 1
            const { req, res } = createMocks({
                method: 'GET',
                headers: { Authorization: `Bearer ${newUser.accessToken}` },
            });
            await sessionsHandler(req, res);
            const data = JSON.parse(res._getData());

            // Check that the new user was added to the first session
            const session1 = Array.from(quizService.getSessions().values())[0];
            expect(session1.participants.has(newUser.user.id)).toBe(true);
        });
    });
});
