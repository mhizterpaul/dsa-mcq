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

describe('Engagement Route Hardened Acceptance Tests', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(async () => {
        jest.useRealTimers();
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Cleanup order to respect FK constraints
        await prisma.notification.deleteMany();
        await prisma.quizParticipant.deleteMany();
        await prisma.quizSession.deleteMany();
        await prisma.session.deleteMany();
        await prisma.leaderboard.deleteMany();
        await prisma.engagement.deleteMany();
        await prisma.user.deleteMany();
    });

    const setupAuth = async (user: any, role: string = 'USER') => {
        const dbUser = await prisma.user.create({ data: { ...user, role } });
        const session = await prisma.session.create({
            data: {
                id: 'session-' + user.id,
                sessionToken: 'token-' + user.id,
                userId: user.id,
                expires: new Date(Date.now() + 1000000)
            }
        });
        return { token: createToken(user, session.id), user: dbUser };
    };

    describe('1. XP & Action Accumulation', () => {
        test('accumulates XP correctly over multiple calls and creates record automatically', async () => {
            const { token } = await setupAuth(userA);

            const callAction = async (xp: number) => {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: { authorization: `Bearer ${token}` },
                    body: { xp }
                });
                await actionHandler(req, res);
                return res;
            };

            await callAction(50);
            await callAction(30);

            const engagement = await prisma.engagement.findUnique({ where: { userId: userA.id } });
            expect(engagement?.xp).toBe(80);
            expect(engagement?.xp_weekly).toBe(80);
        });

        test('rejects negative XP with 400', async () => {
            const { token } = await setupAuth(userA);
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { xp: -500 }
            });

            await actionHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
        });
    });

    describe('2. Leaderboard: Deterministic & Robust', () => {
        test('returns deterministic ranking (XP desc, userId asc) with explicit rank field', async () => {
            await prisma.user.createMany({ data: [userA, userB] });
            // Same XP to test tie-breaking
            await prisma.engagement.create({ data: { userId: userA.id, xp: 500 } });
            await prisma.engagement.create({ data: { userId: userB.id, xp: 500 } });

            const { req, res } = createMocks({ method: 'GET' });
            await leaderboardHandler(req, res);

            const data = JSON.parse(res._getData());
            expect(data).toHaveLength(2);

            // Alice (user-a) should be #1 because user-a < user-b
            expect(data[0].id).toBe(userA.id);
            expect(data[0].rank).toBe(1);
            expect(data[1].id).toBe(userB.id);
            expect(data[1].rank).toBe(2);
        });
    });

    describe('3. Weekly King: Aggregation & Boundaries', () => {
        test('aggregates multi-session scores and excludes cross-week data strictly', async () => {
            // Monday, Feb 24, 2025 as start of week
            const monday = new Date('2025-02-24T12:00:00Z');
            const sundayLastWeek = new Date('2025-02-23T23:59:59Z');

            jest.setSystemTime(monday);

            await prisma.user.createMany({ data: [userA, userB] });

            // Session 1: This week
            await prisma.quizSession.create({ data: { id: 's1', date: new Date('2025-02-24'), startTime: monday } });
            // Session 2: This week
            await prisma.quizSession.create({ data: { id: 's2', date: new Date('2025-02-25'), startTime: new Date('2025-02-25T10:00:00Z') } });
            // Session 3: Last week
            await prisma.quizSession.create({ data: { id: 's_old', date: new Date('2025-02-23'), startTime: sundayLastWeek } });

            await prisma.quizParticipant.createMany({
                data: [
                    { userId: userA.id, sessionId: 's1', score: 10, createdAt: monday },
                    { userId: userA.id, sessionId: 's2', score: 15, createdAt: new Date('2025-02-25T10:05:00Z') },
                    { userId: userB.id, sessionId: 's1', score: 20, createdAt: monday },
                    { userId: userB.id, sessionId: 's_old', score: 100, createdAt: sundayLastWeek } // Should be ignored
                ]
            });

            const { req, res } = createMocks({ method: 'GET' });
            await weeklyKingHandler(req, res);

            const data = JSON.parse(res._getData());
            // User A: 10 + 15 = 25. User B: 20 (this week).
            // King = User A.
            expect(data.userId).toBe(userA.id);
            expect(data.score).toBe(125); // 25 * 5
        });

        test('handles weekly king ties deterministically (userId asc)', async () => {
            jest.setSystemTime(new Date('2025-02-24T12:00:00Z'));
            await prisma.user.createMany({ data: [userA, userB] });
            await prisma.quizSession.create({ data: { id: 's1', date: new Date('2025-02-24'), startTime: new Date() } });

            await prisma.quizParticipant.createMany({
                data: [
                    { userId: userA.id, sessionId: 's1', score: 50, createdAt: new Date() },
                    { userId: userB.id, sessionId: 's1', score: 50, createdAt: new Date() }
                ]
            });

            const { req, res } = createMocks({ method: 'GET' });
            await weeklyKingHandler(req, res);
            const data = JSON.parse(res._getData());
            expect(data.userId).toBe(userA.id); // user-a < user-b
        });
    });

    describe('4. Achievements: Strict Contract & Zero State', () => {
        test('zero-state: returns valid contract for user with no engagement', async () => {
            const { token } = await setupAuth(userA);

            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });

            await achievementsHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            // Strict Contract Validation
            expect(Object.keys(data).sort()).toEqual(['badges', 'leaderboard', 'stats'].sort());
            expect(data.leaderboard.score).toBe(0);
            expect(data.badges.totalUnlocked).toBe(0);
            expect(data.badges.list).toHaveLength(0);
            expect(data.stats.highScore).toBeDefined();
        });

        test('handles dynamic rank correctly in achievement view', async () => {
             await setupAuth(userB);
             await prisma.engagement.create({ data: { userId: userB.id, xp: 5000 } });

             const { token } = await setupAuth(userA);
             await prisma.engagement.create({ data: { userId: userA.id, xp: 1000 } });

             const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
             });

             await achievementsHandler(req, res);
             const data = JSON.parse(res._getData());
             expect(data.leaderboard.rank).toBe(2);
        });
    });

    describe('5. Notifications: Order & Isolation', () => {
        test('returns notifications in most-recent-first order and maintains user isolation', async () => {
            const { token: tokenA } = await setupAuth(userA);
            const { token: tokenB } = await setupAuth(userB);

            // User A creates 2 notifications
            await prisma.notification.create({
                data: { userId: userA.id, message: 'Old', type: 'reminder', sendAt: new Date(), createdAt: new Date(Date.now() - 10000) }
            });
            await prisma.notification.create({
                data: { userId: userA.id, message: 'New', type: 'reminder', sendAt: new Date(), createdAt: new Date() }
            });

            // User B tries to fetch
            const { req: reqB, res: resB } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenB}` }
            });
            await notificationsHandler(reqB, resB);
            expect(JSON.parse(resB._getData())).toHaveLength(0);

            // User A fetches
            const { req: reqA, res: resA } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenA}` }
            });
            await notificationsHandler(reqA, resA);
            const dataA = JSON.parse(resA._getData());
            expect(dataA).toHaveLength(2);
            expect(dataA[0].message).toBe('New');
            expect(dataA[1].message).toBe('Old');
        });
    });

    describe('6. Security & Roles', () => {
        test('ADMIN can access another user\'s engagement data', async () => {
            const { token: adminToken } = await setupAuth({ id: 'admin-id', name: 'Admin', email: 'admin@x.com' }, 'ADMIN');
            await setupAuth(userA);

            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${adminToken}` },
                query: { userId: userA.id }
            });

            await userEngagementHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
        });

        test('Unauthorized user receives 403 when accessing another user\'s engagement', async () => {
            const { token: tokenB } = await setupAuth(userB);
            await setupAuth(userA);

            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenB}` },
                query: { userId: userA.id }
            });

            await userEngagementHandler(req, res);
            expect(res._getStatusCode()).toBe(403);
        });
    });

    describe('7. Data Integrity', () => {
        test('Engagement record is deleted when User is deleted (cascade)', async () => {
            await setupAuth(userA);
            await prisma.engagement.create({ data: { userId: userA.id, xp: 100 } });

            await prisma.user.delete({ where: { id: userA.id } });

            const engagement = await prisma.engagement.findUnique({ where: { userId: userA.id } });
            expect(engagement).toBeNull();
        });
    });
});
