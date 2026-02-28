import { createMocks } from 'node-mocks-http';
import actionHandler from '../../../pages/api/engagement/action';
import { prisma } from '../../../infra/prisma/client';
import { sign } from 'jsonwebtoken';

/**
 * Integration test for API Routes.
 * Verifies the interaction between API handlers, Database, and Auth.
 */
describe('API Routes Integration Test', () => {
    let testUser: any;
    let sessionToken: string;

    beforeAll(async () => {
        // Setup test user and session
        testUser = await prisma.user.create({
            data: {
                email: `api-test-${Date.now()}@example.com`,
                name: 'API Test User',
            },
        });

        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        const session = await prisma.session.create({
            data: {
                sessionToken: `token-${Date.now()}`,
                userId: testUser.id,
                expires: expires,
            },
        });

        sessionToken = sign({ sub: testUser.id, sessionId: session.id }, process.env.JWT_SECRET || 'test-secret');
    });

    afterAll(async () => {
        await prisma.user.delete({ where: { id: testUser.id } });
        await prisma.$disconnect();
    });

    it('should update user XP via /api/engagement/action', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            headers: {
                authorization: `Bearer ${sessionToken}`,
            },
            body: {
                xp: 100,
            },
        });

        // @ts-ignore
        await actionHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);

        // Verify DB update
        const engagement = await prisma.engagement.findUnique({
            where: { userId: testUser.id }
        });
        expect(engagement?.xp).toBe(100);
    });

    it('should return 400 for invalid XP', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            headers: {
                authorization: `Bearer ${sessionToken}`,
            },
            body: {
                xp: -50,
            },
        });

        // @ts-ignore
        await actionHandler(req, res);

        expect(res._getStatusCode()).toBe(400);
    });
});
