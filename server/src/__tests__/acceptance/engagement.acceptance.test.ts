import { createMocks } from 'node-mocks-http';
import actionHandler from '../../pages/api/engagement/action';
import leaderboardHandler from '../../pages/api/engagement/leaderboard';
import weeklyKingHandler from '../../pages/api/engagement/weekly-king';
import achievementsHandler from '../../pages/api/engagement/achievements';
import userEngagementHandler from '../../pages/api/engagement/user-engagement/[userId]';
import notificationsHandler from '../../pages/api/engagement/notifications';
import { prisma } from '../../infra/prisma/client';
import { ENGAGEMENT_CONSTANTS } from '../../utils/constants';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;
process.env.USE_REAL_DB = 'true';

const createToken = (user: any, sessionId: string) => jwt.sign({ user, sessionId }, JWT_SECRET);

const userA = { id: 'user-a', name: 'Alice', email: 'alice@example.com', image: 'avatar-a' };
const userB = { id: 'user-b', name: 'Bob', email: 'bob@example.com', image: 'avatar-b' };

/**
 * HARDENED ENGAGEMENT ROUTE ACCEPTANCE SUITE
 *
 * Enforces:
 * - Deterministic sorting and explicit ranking
 * - Multi-session aggregation and cross-week exclusion (ISO-8601 Monday start)
 * - Strict contract freezing for Achievements and Leaderboard
 * - Security isolation and ADMIN role policy
 * - Data integrity (cascades)
 * - Input validation and API discipline (405s)
 *
 * NOTE: This suite uses fixed system time for aggregation tests.
 * Prisma timestamps must be explicitly set in data to respect Jest fake timers
 * if the DB uses native defaults.
 */
describe('Engagement Route Hardened Acceptance Tests (Enterprise Grade)', () => {
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

    describe('1. XP & Action Handling', () => {
        test('accumulates XP across multiple calls and creates record automatically', async () => {
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

        test('rejects negative XP (400)', async () => {
            const { token } = await setupAuth(userA);
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { xp: -500 }
            });
            await actionHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
        });

        test('handles zero XP submission (200)', async () => {
            const { token } = await setupAuth(userA);
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { xp: 0 }
            });
            await actionHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
        });

        test('rejects missing xp field in body (400)', async () => {
            const { token } = await setupAuth(userA);
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { foo: 'bar' }
            });
            await actionHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
        });

        test('large XP values stress test (prevents 32-bit overflow)', async () => {
            const { token } = await setupAuth(userA);
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { xp: 2000000001 }
            });
            await actionHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData()).message).toContain('large');
        });
    });

    describe('2. Leaderboard: Deterministic sorting & Contract Locking', () => {
        test('returns deterministic ranking (XP desc, userId asc) with explicit rank', async () => {
            await prisma.user.createMany({ data: [userA, userB] });
            // Same XP to trigger tie-breaking logic
            await prisma.engagement.create({ data: { userId: userA.id, xp: 500 } });
            await prisma.engagement.create({ data: { userId: userB.id, xp: 500 } });

            const { req, res } = createMocks({ method: 'GET' });
            await leaderboardHandler(req, res);

            const data = JSON.parse(res._getData());
            expect(data).toHaveLength(2);

            // user-a < user-b
            expect(data[0].id).toBe(userA.id);
            expect(data[0].rank).toBe(1);
            expect(data[1].id).toBe(userB.id);
            expect(data[1].rank).toBe(2);
        });

        test('freezes contract: response must contain full metadata for UI rendering', async () => {
            await setupAuth(userA);
            await prisma.engagement.create({ data: { userId: userA.id, xp: 123 } });

            const { req, res } = createMocks({ method: 'GET' });
            await leaderboardHandler(req, res);
            const player = JSON.parse(res._getData())[0];

            expect(player).toEqual({
                id: userA.id,
                name: userA.name,
                avatar: expect.any(String),
                score: 123,
                rank: 1,
                level: expect.any(Number),
                highestBadgeIcon: expect.any(String)
            });
        });
    });

    describe('3. Weekly King: Aggregation & Temporal Hardening', () => {
        test('aggregates multi-session scores and strictly excludes past-week data', async () => {
            // Monday, Feb 24, 2025
            const monday = new Date('2025-02-24T12:00:00Z');
            const lastSunday = new Date('2025-02-23T23:59:59Z');

            jest.setSystemTime(monday);

            await prisma.user.createMany({ data: [userA, userB] });

            // Session 1: Monday (this week)
            await prisma.quizSession.create({ data: { id: 's1', date: new Date('2025-02-24'), startTime: monday } });
            // Session 2: Tuesday (this week)
            await prisma.quizSession.create({ data: { id: 's2', date: new Date('2025-02-25'), startTime: new Date('2025-02-25T10:00:00Z') } });
            // Session 3: Sunday (last week)
            await prisma.quizSession.create({ data: { id: 's_old', date: new Date('2025-02-23'), startTime: lastSunday } });

            await prisma.quizParticipant.createMany({
                data: [
                    { userId: userA.id, sessionId: 's1', score: 10, createdAt: monday },
                    { userId: userA.id, sessionId: 's2', score: 15, createdAt: new Date('2025-02-25T10:05:00Z') },
                    { userId: userB.id, sessionId: 's1', score: 20, createdAt: monday },
                    { userId: userB.id, sessionId: 's_old', score: 100, createdAt: lastSunday }
                ]
            });

            const { req, res } = createMocks({ method: 'GET' });
            await weeklyKingHandler(req, res);

            const data = JSON.parse(res._getData());
            // User A (this week): 10 + 15 = 25. User B (this week): 20.
            // Result should be User A.
            expect(data.userId).toBe(userA.id);
            expect(data.score).toBe(25 * ENGAGEMENT_CONSTANTS.XP_MULTIPLIER);
        });

        test('handles ties deterministically using userId asc', async () => {
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
            expect(JSON.parse(res._getData()).userId).toBe(userA.id);
        });
    });

    describe('4. Achievements: Zero-State & Complete Contract', () => {
        test('zero-state resilience: returns full contract even for new users', async () => {
            const { token } = await setupAuth(userA);

            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });

            await achievementsHandler(req, res);
            const data = JSON.parse(res._getData());

            expect(Object.keys(data).sort()).toEqual(['badges', 'leaderboard', 'stats'].sort());
            expect(data.leaderboard.score).toBe(0);
            expect(data.stats).toEqual(expect.objectContaining({
                highScore: expect.any(Number),
                longestStreak: expect.any(String),
                quizzesPlayed: expect.any(Number)
            }));
        });
    });

    describe('5. Notifications: Order & POST Validation', () => {
        test('POST validates missing fields and returns 400', async () => {
            const { token } = await setupAuth(userA);
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { message: 'Incomplete' } // Missing type
            });
            await notificationsHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
        });

        test('returns notifications newest-first', async () => {
            const { token } = await setupAuth(userA);
            await prisma.notification.create({
                data: { userId: userA.id, message: 'Old', type: 'reminder', sendAt: new Date(), createdAt: new Date(Date.now() - 10000) }
            });
            await prisma.notification.create({
                data: { userId: userA.id, message: 'New', type: 'reminder', sendAt: new Date(), createdAt: new Date() }
            });

            const { req, res } = createMocks({ method: 'GET', headers: { authorization: `Bearer ${token}` } });
            await notificationsHandler(req, res);
            const data = JSON.parse(res._getData());
            expect(data[0].message).toBe('New');
            expect(data[1].message).toBe('Old');
        });
    });

    describe('6. Security: ADMIN Policy & Isolation', () => {
        test('ADMIN bypasses isolation while USER is strictly restricted (403)', async () => {
            const { token: adminToken } = await setupAuth({ id: 'adm', name: 'Admin', email: 'adm@x.com' }, 'ADMIN');
            const { token: userToken } = await setupAuth(userB);
            await setupAuth(userA);

            // Admin can see userA
            const { req: r1, res: rs1 } = createMocks({ method: 'GET', headers: { authorization: `Bearer ${adminToken}` }, query: { userId: userA.id } });
            await userEngagementHandler(r1, rs1);
            expect(rs1._getStatusCode()).toBe(200);

            // UserB cannot see userA
            const { req: r2, res: rs2 } = createMocks({ method: 'GET', headers: { authorization: `Bearer ${userToken}` }, query: { userId: userA.id } });
            await userEngagementHandler(r2, rs2);
            expect(rs2._getStatusCode()).toBe(403);
        });
    });

    describe('7. API Discipline: Method 405 Enforcement', () => {
        test.each([
            ['/action', actionHandler, 'GET'],
            ['/leaderboard', leaderboardHandler, 'POST'],
            ['/weekly-king', weeklyKingHandler, 'POST'],
            ['/achievements', achievementsHandler, 'POST'],
        ])('%s returns 405 for %s', async (_, handler, method) => {
            const { token } = await setupAuth(userA);
            const { req, res } = createMocks({ method: method as any, headers: { authorization: `Bearer ${token}` } });
            await handler(req, res);
            expect(res._getStatusCode()).toBe(405);
        });
    });

    describe('8. Data Integrity: Cascade Deletion', () => {
        test('deleting a user purges all engagement and notification artifacts', async () => {
            await setupAuth(userA);
            await prisma.engagement.create({ data: { userId: userA.id, xp: 10 } });
            await prisma.notification.create({ data: { userId: userA.id, message: 'bye', type: 'nudge', sendAt: new Date() } });

            await prisma.user.delete({ where: { id: userA.id } });

            expect(await prisma.engagement.findUnique({ where: { userId: userA.id } })).toBeNull();
            const notifications = await prisma.notification.findMany({ where: { userId: userA.id } });
            expect(notifications).toHaveLength(0);
        });
    });
});
