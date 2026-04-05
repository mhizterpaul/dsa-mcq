import { createMocks } from 'node-mocks-http';
import providerSigninHandler from '../../../pages/api/auth/provider-signin';
import { prisma } from '../../../infra/prisma/client';
import { ensureIntegrationTestEnv } from '../setup';

/**
 * Integration test for OAuth Provider Sign-in.
 */
describe('OAuth Provider Integration Test', () => {
    beforeAll(async () => {
        ensureIntegrationTestEnv();
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    it('should successfully sign in with a valid Google token (mocked)', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                provider: 'google',
                token: 'valid-token'
            }
        });

        await providerSigninHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.token).toBeDefined();
        expect(data.user.email).toBe('test@example.com');

        const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
        expect(user).toBeTruthy();
    });

    it('should fail with an invalid token', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                provider: 'google',
                token: 'invalid-token'
            }
        });

        await providerSigninHandler(req, res);

        expect(res._getStatusCode()).toBe(401);
    });

    it('should fail with missing provider or token', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                provider: 'google'
            }
        });

        await providerSigninHandler(req, res);

        expect(res._getStatusCode()).toBe(400);
    });
});
