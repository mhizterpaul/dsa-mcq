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

const createToken = (user: any, sessionId: string) => jwt.sign({ user: { id: user.id }, sessionId }, JWT_SECRET);

const userA = { id: 'user-a', name: 'Alice', email: 'alice@example.com', image: 'avatar-a' };
const userB = { id: 'user-b', name: 'Bob', email: 'bob@example.com', image: 'avatar-b' };

describe('Engagement Route Hardened Acceptance Tests (Enterprise Grade)', () => {
    beforeAll(() => {
    });

    afterAll(async () => {
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
                body: { xp: 2000000 }
            });
            await actionHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData()).message).toContain('large');
        });
    });

    describe('2. Leaderboard: Deterministic sorting & Contract Locking', () => {
        test('returns deterministic ranking (XP desc, userId asc) with explicit rank', async () => {
            await prisma.user.createMany({ data: [userA, userB] });
            await prisma.engagement.create({ data: { userId: userA.id, xp: 500 } });
            await prisma.engagement.create({ data: { userId: userB.id, xp: 500 } });

            const { req, res } = createMocks({ method: 'GET' });
            await leaderboardHandler(req, res);

            const data = JSON.parse(res._getData());
            expect(data).toHaveLength(2);
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
            const now = new Date();
            const monday = new Date(now);
            const day = now.getDay();
            const diff = day === 0 ? -6 : 1 - day;
            monday.setDate(now.getDate() + diff);
            monday.setHours(12, 0, 0, 0);

            const lastSunday = new Date(monday);
            lastSunday.setDate(monday.getDate() - 1);
            lastSunday.setHours(23, 59, 59, 0);

            await prisma.user.createMany({ data: [userA, userB] });

            await prisma.quizSession.create({ data: { id: 's1', date: new Date(monday), startTime: monday } });
            await prisma.quizSession.create({ data: { id: 's2', date: new Date(monday.getTime() + 86400000), startTime: new Date(monday.getTime() + 86400000) } });
            await prisma.quizSession.create({ data: { id: 's_old', date: new Date(lastSunday), startTime: lastSunday } });

            await prisma.quizParticipant.createMany({
                data: [
                    { userId: userA.id, sessionId: 's1', score: 10, createdAt: monday },
                    { userId: userA.id, sessionId: 's2', score: 15, createdAt: new Date(monday.getTime() + 86400000) },
                    { userId: userB.id, sessionId: 's1', score: 20, createdAt: monday },
                    { userId: userB.id, sessionId: 's_old', score: 100, createdAt: lastSunday }
                ]
            });

            const { req, res } = createMocks({ method: 'GET' });
            await weeklyKingHandler(req, res);

            const data = JSON.parse(res._getData());
            expect(data.userId).toBe(userA.id);
            expect(data.score).toBe(25 * ENGAGEMENT_CONSTANTS.XP_MULTIPLIER);
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
        });
    });

    describe('5. Notifications: Order & POST Validation', () => {
        test('POST validates missing fields and returns 400', async () => {
            const { token } = await setupAuth(userA);
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { message: 'Incomplete' }
            });
            await notificationsHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
        });

        test('returns notifications newest-first', async () => {
            const { token } = await setupAuth(userA);
            const now = Date.now();
            await prisma.notification.create({
                data: { userId: userA.id, message: 'Old', type: 'reminder', sendAt: new Date(now - 10000), createdAt: new Date(now - 10000) }
            });
            await prisma.notification.create({
                data: { userId: userA.id, message: 'New', type: 'reminder', sendAt: new Date(now), createdAt: new Date(now) }
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

            const { req: r1, res: rs1 } = createMocks({ method: 'GET', headers: { authorization: `Bearer ${adminToken}` }, query: { userId: userA.id } });
            await userEngagementHandler(r1, rs1);
            expect(rs1._getStatusCode()).toBe(200);

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
