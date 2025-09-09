import { createMocks } from 'node-mocks-http';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { syncHandler } from '../src/pages/api/sync';
import { generateSignature } from '../src/utils/signature';
import { prismock as prisma } from './helpers/prismock';

// Helper function to create an authenticated user
async function createAuthenticatedUser(email = 'testuser@example.com', password = 'TestPassword123!') {
  const user = await prisma.user.create({ data: { email, password } });
  const accessToken = jwt.sign({ user }, 'your-jwt-secret');
  return { user, accessToken };
}

describe('/api/sync', () => {
    beforeEach(async () => {
        await prisma.engagement.deleteMany({});
        await prisma.user.deleteMany({});
    });

    afterAll(async () => {
        // await prisma.$disconnect();
    });

    it('should sync client data with the server', async () => {
        const { user, accessToken } = await createAuthenticatedUser();

        const dirtyData = {
            'Engagement': [
                { userId: user.id, xp: 150, is_dirty: 1, updatedAt: Date.now() },
            ],
        };

        const signature = generateSignature(dirtyData);

        const { req, res } = createMocks({
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'x-client-signature': signature,
            },
            body: dirtyData,
        });

        await syncHandler(req, res, prisma);

        expect(res._getStatusCode()).toBe(200);

        const engagement = await prisma.engagement.findUnique({ where: { userId: user.id } });
        expect(engagement.xp).toBe(150);
    });

    it('should return 401 for unauthenticated users', async () => {
        const { req, res } = createMocks({ method: 'POST' });
        // We can't test the default handler easily, so we test the logic handler
        // with a missing user, which should be caught by getAuthenticatedUser
        await syncHandler(req, res, prisma);
        expect(res._getStatusCode()).toBe(401);
    });

    it('should return 401 for invalid signature', async () => {
        const { accessToken } = await createAuthenticatedUser();
        const { req, res } = createMocks({
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'x-client-signature': 'invalid-signature',
            },
        });
        await syncHandler(req, res, prisma);
        expect(res._getStatusCode()).toBe(401);
    });
});
