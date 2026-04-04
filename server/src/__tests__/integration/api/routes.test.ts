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
    const jwtSecret = process.env.JWT_SECRET!;

    beforeAll(async () => {
        ensureIntegrationTestEnv();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    const setupTestUserAndSession = async () => {
        const testUser = await prisma.user.create({
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

        const token = sign({ user: testUser, sessionId: session.id }, jwtSecret);
        return { testUser, token };
    };

    it('should update user XP via /api/engagement/action and accumulate', async () => {
        const { testUser, token } = await setupTestUserAndSession();

        // First call
        const { req: req1, res: res1 } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
            body: { xp: 100 },
        });
        // @ts-ignore
        await actionHandler(req1, res1);
        expect(res1._getStatusCode()).toBe(200);

        // Second call (accumulation check)
        const { req: req2, res: res2 } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${token}` },
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

        // Cleanup
        await prisma.user.delete({ where: { id: testUser.id } });
    });

    it('should handle parallel API calls (concurrency)', async () => {
        const { testUser, token } = await setupTestUserAndSession();

        const calls = Array.from({ length: 5 }, () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { xp: 10 },
            });
            // @ts-ignore
            return actionHandler(req, res);
        });

        await Promise.all(calls);

        const engagement = await prisma.engagement.findUnique({
            where: { userId: testUser.id }
        });
        expect(engagement?.xp).toBe(50);

        await prisma.user.delete({ where: { id: testUser.id } });
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

    it('should handle boundary XP values', async () => {
        const { testUser, token } = await setupTestUserAndSession();

        const boundaries = [
            { xp: 0, expected: 200 },
            { xp: 1000000, expected: 200 },
            { xp: -1, expected: 400 },
            { xp: 2000000, expected: 400 }, // Over limit
            { xp: '100', expected: 400 }, // String
        ];

        for (const b of boundaries) {
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { xp: b.xp },
            });
            // @ts-ignore
            await actionHandler(req, res);
            expect(res._getStatusCode()).toBe(b.expected);
        }

        await prisma.user.delete({ where: { id: testUser.id } });
    });
});
