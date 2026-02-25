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
    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(async () => {
        jest.useRealTimers();
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.notification.deleteMany();
        await prisma.quizParticipant.deleteMany();
        await prisma.quizSession.deleteMany();
        await prisma.session.deleteMany();
        await prisma.engagement.deleteMany();
        await prisma.leaderboard.deleteMany();
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
        test('accumulates XP correctly over multiple calls', async () => {
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
                body: { xp: -100 }
            });

            await actionHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
        });
    });

    describe('Leaderboard & Achievements', () => {
        test('returns leaderboard data in expected format with deterministic tie-breaking', async () => {
            await prisma.user.createMany({ data: [userA, userB] });
            await prisma.engagement.create({ data: { userId: userA.id, xp: 500 } });
            await prisma.engagement.create({ data: { userId: userB.id, xp: 500 } });

            const { req, res } = createMocks({ method: 'GET' });
            await leaderboardHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());
            expect(data).toHaveLength(2);
            // user-a < user-b alphabetically
            expect(data[0].id).toBe(userA.id);
            expect(data[1].id).toBe(userB.id);
        });

        test('returns achievements data for a user with dynamic rank', async () => {
            const { token } = await setupAuth(userA);

            // Create 4 other users with more XP to make Alice rank 5
            for(let i=1; i<=4; i++) {
                const other = { id: `other-${i}`, email: `other-${i}@x.com`, name: `Other ${i}` };
                await prisma.user.create({ data: other });
                await prisma.engagement.create({ data: { userId: other.id, xp: 2000 + i } });
            }

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
            expect(data.leaderboard.competitors.length).toBeGreaterThan(0);

            // Strict contract validation
            expect(data).toEqual(expect.objectContaining({
                badges: expect.objectContaining({
                    totalUnlocked: expect.any(Number),
                    list: expect.any(Array),
                    nextBadge: expect.any(Array)
                }),
                leaderboard: expect.objectContaining({
                    score: expect.any(Number),
                    rank: expect.any(Number),
                    competitors: expect.any(Array)
                }),
                stats: expect.any(Object)
            }));
        });
    });

    describe('Weekly King of Quiz', () => {
        test('calculates weekly king from daily quiz scores and excludes past weeks', async () => {
            const fixedDate = new Date('2025-02-26T12:00:00Z'); // Wednesday
            jest.setSystemTime(fixedDate);

            await prisma.user.createMany({ data: [userA, userB] });

            // Session this week
            const session1 = await prisma.quizSession.create({
                data: { id: 's1', date: new Date('2025-02-24'), startTime: new Date('2025-02-24T10:00:00Z') }
            });
            // Session last week
            const sessionOld = await prisma.quizSession.create({
                data: { id: 's_old', date: new Date('2025-02-17'), startTime: new Date('2025-02-17T10:00:00Z') }
            });

            await prisma.quizParticipant.createMany({
                data: [
                    { userId: userA.id, sessionId: 's1', score: 10, createdAt: new Date('2025-02-24T10:05:00Z') },
                    { userId: userB.id, sessionId: 's1', score: 20, createdAt: new Date('2025-02-24T10:05:00Z') },
                    { userId: userA.id, sessionId: 's_old', score: 100, createdAt: new Date('2025-02-17T10:05:00Z') }
                ]
            });

            const { req, res } = createMocks({ method: 'GET' });
            await weeklyKingHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());
            expect(data.userId).toBe(userB.id);
            expect(data.score).toBe(100); // 20 * 5
        });
    });

    describe('User Engagement Details', () => {
        test('returns user-specific engagement data and enforces authorization', async () => {
            const { token: tokenA } = await setupAuth(userA);
            const { token: tokenB } = await setupAuth(userB);
            await prisma.engagement.create({ data: { userId: userA.id, xp: 300 } });

            // User A accesses their own data
            const { req: reqA, res: resA } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenA}` },
                query: { userId: userA.id }
            });
            await userEngagementHandler(reqA, resA);
            expect(resA._getStatusCode()).toBe(200);

            // User B tries to access user A's data
            const { req: reqB, res: resB } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenB}` },
                query: { userId: userA.id }
            });
            await userEngagementHandler(reqB, resB);
            expect(resB._getStatusCode()).toBe(403);
        });
    });

    describe('Notifications', () => {
        test('creates and retrieves notifications with isolation', async () => {
            const { token: tokenA } = await setupAuth(userA);
            const { token: tokenB } = await setupAuth(userB);

            // Create A's notification
            const { req: reqPost } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${tokenA}` },
                body: { message: 'Hello Alice', type: 'reminder' }
            });
            await notificationsHandler(reqPost, createMocks().res);

            // Retrieve B's notifications
            const { req: reqGetB, res: resGetB } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenB}` }
            });
            await notificationsHandler(reqGetB, resGetB);
            expect(JSON.parse(resGetB._getData())).toHaveLength(0);

            // Retrieve A's notifications
            const { req: reqGetA, res: resGetA } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenA}` }
            });
            await notificationsHandler(reqGetA, resGetA);
            expect(JSON.parse(resGetA._getData())).toHaveLength(1);
        });
    });
});
