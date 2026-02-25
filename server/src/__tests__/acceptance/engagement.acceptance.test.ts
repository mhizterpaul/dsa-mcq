import { createMocks } from 'node-mocks-http';
import actionHandler from '../../pages/api/engagement/action';
import leaderboardHandler from '../../pages/api/engagement/leaderboard';
import weeklyKingHandler from '../../pages/api/engagement/weekly-king';
import achievementsHandler from '../../pages/api/engagement/achievements';
import userEngagementHandler from '../../pages/api/engagement/user-engagement/[userId]';
import notificationsHandler from '../../pages/api/engagement/notifications';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;
process.env.USE_REAL_DB = 'true';

const createToken = (user: any, sessionId: string) => jwt.sign({ user, sessionId }, JWT_SECRET);

const userA = { id: 'user-a', name: 'Alice', email: 'alice@example.com', image: 'avatar-a' };
const userB = { id: 'user-b', name: 'Bob', email: 'bob@example.com', image: 'avatar-b' };

describe('Engagement Route Acceptance Tests', () => {
    beforeEach(async () => {
        await prisma.notification.deleteMany();
        await prisma.quizParticipant.deleteMany();
        await prisma.quizSession.deleteMany();
        await prisma.session.deleteMany();
        await prisma.engagement.deleteMany();
        await prisma.leaderboard.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    const setupAuth = async (user: any) => {
        await prisma.user.create({ data: user });
        const session = await prisma.session.create({
            data: {
                id: 'session-' + user.id,
                sessionToken: 'token-' + user.id,
                userId: user.id,
                expires: new Date(Date.now() + 1000000)
            }
        });
        return createToken(user, session.id);
    };

    describe('Security', () => {
        test.each([
            ['action', actionHandler],
            ['achievements', achievementsHandler],
            ['notifications', notificationsHandler],
        ])('%s endpoint rejects unauthenticated requests', async (_, handler) => {
            const { req, res } = createMocks({ method: 'GET' });
            await handler(req, res);
            expect(res._getStatusCode()).toBe(401);
        });
    });

    describe('XP & Action Handling', () => {
        test('updates user XP via action endpoint', async () => {
            const token = await setupAuth(userA);

            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { xp: 50 }
            });

            await actionHandler(req, res);
            expect(res._getStatusCode()).toBe(200);

            const engagement = await prisma.engagement.findUnique({ where: { userId: userA.id } });
            expect(engagement?.xp).toBe(50);
            expect(engagement?.xp_weekly).toBe(50);
        });
    });

    describe('Leaderboard & Achievements', () => {
        test('returns leaderboard data in expected format', async () => {
            await prisma.user.createMany({ data: [userA, userB] });
            await prisma.engagement.create({ data: { userId: userA.id, xp: 100 } });
            await prisma.engagement.create({ data: { userId: userB.id, xp: 200 } });

            const { req, res } = createMocks({ method: 'GET' });
            await leaderboardHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());
            expect(data).toHaveLength(2);
            expect(data[0].id).toBe(userB.id);
            expect(data[0].score).toBe(200);
            expect(data[1].id).toBe(userA.id);
        });

        test('returns achievements data for a user', async () => {
            const token = await setupAuth(userA);
            await prisma.leaderboard.create({ data: { userId: userA.id, rank: 5, xp: 1000 } });
            await prisma.engagement.create({ data: { userId: userA.id, xp: 1000 } });

            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });

            await achievementsHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());
            expect(data.badges).toBeDefined();
            expect(data.leaderboard.score).toBe(1000);
            expect(data.leaderboard.rank).toBe(5);
            expect(data.leaderboard.competitors).toHaveLength(1);
        });
    });

    describe('Weekly King of Quiz', () => {
        test('calculates weekly king from daily quiz scores', async () => {
            await prisma.user.createMany({ data: [userA, userB] });
            const today = new Date();
            const session = await prisma.quizSession.create({
                data: { id: 's1', date: today, startTime: new Date(), endTime: new Date() }
            });

            await prisma.quizParticipant.createMany({
                data: [
                    { userId: userA.id, sessionId: session.id, score: 10, createdAt: today },
                    { userId: userB.id, sessionId: session.id, score: 20, createdAt: today },
                ]
            });

            const { req, res } = createMocks({ method: 'GET' });
            await weeklyKingHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());
            expect(data.userId).toBe(userB.id);
            expect(data.score).toBe(100); // 20 * 5
        });

        test('returns null when no participants this week', async () => {
            const { req, res } = createMocks({ method: 'GET' });
            await weeklyKingHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
            expect(res._getData()).toBe('null');
        });
    });

    describe('User Engagement Details', () => {
        test('returns user-specific engagement data', async () => {
            await prisma.user.create({ data: userA });
            await prisma.engagement.create({ data: { userId: userA.id, xp: 300 } });

            const { req, res } = createMocks({
                method: 'GET',
                query: { userId: userA.id }
            });

            await userEngagementHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());
            expect(data.userId).toBe(userA.id);
            expect(data.xp).toBe(300);
            expect(data.streak_length).toBeDefined();
        });
    });

    describe('Notifications', () => {
        test('creates and retrieves notifications', async () => {
            const token = await setupAuth(userA);

            // Create
            const { req: reqPost, res: resPost } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { message: 'Hello Alice', type: 'reminder' }
            });
            await notificationsHandler(reqPost, resPost);
            expect(resPost._getStatusCode()).toBe(201);

            // Retrieve
            const { req: reqGet, res: resGet } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });
            await notificationsHandler(reqGet, resGet);
            expect(resGet._getStatusCode()).toBe(200);
            const data = JSON.parse(resGet._getData());
            expect(data).toHaveLength(1);
            expect(data[0].message).toBe('Hello Alice');
        });
    });
});
