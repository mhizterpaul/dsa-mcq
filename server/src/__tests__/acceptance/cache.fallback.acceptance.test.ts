import { createMocks } from 'node-mocks-http';
import profileSummaryHandler from '../../pages/api/user/profile-summary';
import { prisma } from '../../infra/prisma/client';
import { userController } from '../../controllers/userController';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

describe('Cache Fallback Acceptance Scenario', () => {
    const testUser = { id: 'cache-user-1', email: 'cache@test.com', name: 'CacheUser' };
    let token: string;

    beforeAll(() => {
        process.env.FORCE_FILE_CACHE = 'true';
    });

    afterAll(() => {
        delete process.env.FORCE_FILE_CACHE;
    });

    beforeEach(async () => {
        await prisma.session.deleteMany();
        await prisma.engagement.deleteMany();
        await prisma.leaderboard.deleteMany();
        await prisma.quizParticipant.deleteMany();
        await prisma.quizSession.deleteMany();
        await prisma.leaderboard.deleteMany();
        await prisma.engagement.deleteMany();
        await prisma.learningSession.deleteMany();
        await prisma.userQuestionData.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.media.deleteMany();
        await prisma.account.deleteMany();
        await prisma.verificationToken.deleteMany();
        await prisma.user.deleteMany();

        // Ensure cache directory is clean
        const cacheDir = path.resolve('.cache');
        if (fs.existsSync(cacheDir)) {
            fs.rmSync(cacheDir, { recursive: true, force: true });
        }

        await prisma.user.create({ data: testUser });
        const session = await prisma.session.create({
            data: {
                id: 'cache-sess',
                userId: testUser.id,
                sessionToken: 'tk-cache',
                expires: new Date(Date.now() + 3600000)
            }
        });
        token = jwt.sign({ user: { id: testUser.id }, sessionId: session.id }, JWT_SECRET);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    /**
     * @Doc("Scenario K: DB Failure -> Cache Fallback")
     * @Route("/api/user/profile-summary")
     */
    test('should_return_from_cache_given_db_failure', async () => {
        // 1. Warm the cache
        const { req: req1, res: res1 } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` }
        });
        await profileSummaryHandler(req1 as any, res1 as any);
        expect(res1._getStatusCode()).toBe(200);
        expect(JSON.parse(res1._getData()).source).toBe('DB');

        // 2. Simulate DB failure by mocking userController
        const spy = jest.spyOn(userController, 'getProfileSummary').mockRejectedValue(new Error('DB Connection Error'));

        // 3. Request again, should hit cache
        const { req: req2, res: res2 } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` }
        });
        await profileSummaryHandler(req2 as any, res2 as any);

        expect(res2._getStatusCode()).toBe(200);
        const data = JSON.parse(res2._getData());
        expect(data.source).toBe('CACHE');
        expect(data.user.id).toBe(testUser.id);

        spy.mockRestore();
    });

    test('should_return_500_given_db_failure_and_cache_miss', async () => {
        const spy = jest.spyOn(userController, 'getProfileSummary').mockRejectedValue(new Error('DB Connection Error'));

        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` }
        });
        await profileSummaryHandler(req as any, res as any);

        expect(res._getStatusCode()).toBe(500);
        spy.mockRestore();
    });

    test('should_not_leak_cache_across_users', async () => {
        const userB = { id: 'user-b', email: 'b@test.com', name: 'UserB' };
        await prisma.user.create({ data: userB });
        const sessionB = await prisma.session.create({
            data: { id: 'sess-b', userId: userB.id, sessionToken: 'tk-b', expires: new Date(Date.now() + 3600000) }
        });
        const tokenB = jwt.sign({ user: { id: userB.id }, sessionId: sessionB.id }, JWT_SECRET);

        // 1. Warm cache for User A
        const { req: reqA, res: resA } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` }
        });
        await profileSummaryHandler(reqA as any, resA as any);
        expect(resA._getStatusCode()).toBe(200);

        // 2. Simulate DB failure
        const spy = jest.spyOn(userController, 'getProfileSummary').mockRejectedValue(new Error('DB Failure'));

        // 3. User B requests, should NOT see User A's data (Cache Miss)
        const { req: reqB, res: resB } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${tokenB}` }
        });
        await profileSummaryHandler(reqB as any, resB as any);

        expect(resB._getStatusCode()).toBe(500); // Because it didn't hit User A's cache

        spy.mockRestore();
    });

    test('should_authorize_when_db_down_using_cache', async () => {
        // 1. Warm Auth Cache
        const { req: req1, res: res1 } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` }
        });
        await profileSummaryHandler(req1 as any, res1 as any);

        // 2. Mock DB failure for validateSession (Prisma call)
        const validateSpy = jest.spyOn(prisma.session, 'findUnique').mockRejectedValue(new Error('Database Connection Error'));
        const controllerSpy = jest.spyOn(userController, 'getProfileSummary').mockRejectedValue(new Error('DB Connection Error'));

        // 3. Request should still authorize and return cached profile
        const { req: req2, res: res2 } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` }
        });
        await profileSummaryHandler(req2 as any, res2 as any);

        expect(res2._getStatusCode()).toBe(200);
        expect(JSON.parse(res2._getData()).source).toBe('CACHE');

        validateSpy.mockRestore();
        controllerSpy.mockRestore();
    });
});
