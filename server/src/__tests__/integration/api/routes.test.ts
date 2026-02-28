import { createMocks } from 'node-mocks-http';
import actionHandler from '../../../pages/api/engagement/action';
import { prisma } from '../../../infra/prisma/client';
import { sign } from 'jsonwebtoken';
import { ensureIntegrationTestEnv } from '../setup';
import { v4 as uuidv4 } from 'uuid';

/**
 * Integration test for API Routes.
 */
describe('API Routes Integration Test', () => {
    let testUser: any;
    let sessionToken: string;
    const jwtSecret = process.env.JWT_SECRET!;

    beforeAll(async () => {
        ensureIntegrationTestEnv();
        // Setup test user and session
        testUser = await prisma.user.create({
            data: {
                email: `api-${uuidv4()}@example.com`,
                name: 'API User',
            },
        });

        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        const session = await prisma.session.create({
            data: {
                sessionToken: `token-${uuidv4()}`,
                userId: testUser.id,
                expires: expires,
            },
        });

        sessionToken = sign({ sub: testUser.id, sessionId: session.id }, jwtSecret);
    });

    afterAll(async () => {
        await prisma.user.delete({ where: { id: testUser.id } });
        await prisma.$disconnect();
    });

    it('should update user XP via /api/engagement/action and accumulate', async () => {
        // First call
        const { req: req1, res: res1 } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${sessionToken}` },
            body: { xp: 100 },
        });
        // @ts-ignore
        await actionHandler(req1, res1);
        expect(res1._getStatusCode()).toBe(200);

        // Second call (accumulation check)
        const { req: req2, res: res2 } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${sessionToken}` },
            body: { xp: 50 },
        });
        // @ts-ignore
        await actionHandler(req2, res2);
        expect(res2._getStatusCode()).toBe(200);

        // Verify DB accumulation
        const engagement = await prisma.engagement.findUnique({
            where: { userId: testUser.id }
        });
        expect(engagement?.xp).toBe(150);
    });

    it('should fail on missing auth token', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: { xp: 100 },
        });
        // @ts-ignore
        await actionHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    it('should fail on invalid signature', async () => {
        const invalidToken = sign({ sub: testUser.id }, 'wrong-secret');
        const { req, res } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${invalidToken}` },
            body: { xp: 100 },
        });
        // @ts-ignore
        await actionHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    it('should handle parallel API calls (concurrency)', async () => {
        const calls = Array.from({ length: 5 }, () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${sessionToken}` },
                body: { xp: 10 },
            });
            // @ts-ignore
            return actionHandler(req, res);
        });

        await Promise.all(calls);

        const engagement = await prisma.engagement.findUnique({
            where: { userId: testUser.id }
        });
        // Previous XP was 150 + (5 * 10) = 200
        expect(engagement?.xp).toBe(200);
    });

    it('should return 400 for invalid XP values', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${sessionToken}` },
            body: { xp: -1 },
        });
        // @ts-ignore
        await actionHandler(req, res);
        expect(res._getStatusCode()).toBe(400);
    });
});
