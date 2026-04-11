import { createMocks } from 'node-mocks-http';
import { requestPasswordResetHandler } from '../../pages/api/auth/request-password-reset';
import { resetPasswordHandler } from '../../pages/api/auth/reset-password';
import loginHandler from '../../pages/api/auth/login';
import { prisma } from '../../infra/prisma/client';
import { MailService } from '../../infra/mailService';
import { generateSignature } from '../../utils/signature';
import argon2 from 'argon2';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

describe('Password Reset Acceptance Scenario', () => {
    const testUser = {
        email: 'reset-test@example.com',
        password: 'old-password',
        name: 'ResetUser'
    };

    beforeEach(async () => {
        await prisma.verificationToken.deleteMany();
        await prisma.session.deleteMany();
        await prisma.user.deleteMany();

        // Register user directly for speed
        const hashedPassword = await argon2.hash(testUser.password);
        await prisma.user.create({
            data: {
                email: testUser.email,
                password: hashedPassword,
                name: testUser.name
            }
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    /**
     * @Doc("Scenario C: Password Reset Flow")
     * @Route("/api/auth/request-password-reset")
     * @Route("/api/auth/reset-password")
     */
    test('should_successfully_reset_password_given_valid_token', async () => {
        // 1. Request Password Reset
        const mockMailService = {
            sendMail: jest.fn().mockResolvedValue({}),
        } as unknown as MailService;

        const requestBody = { email: testUser.email };
        const signature = generateSignature(requestBody, JWT_SECRET);

        const { req: reqReq, res: reqRes } = createMocks({
            method: 'POST',
            headers: { 'x-client-signature': signature },
            body: requestBody
        });

        await requestPasswordResetHandler(reqReq as any, reqRes as any, prisma, mockMailService);
        expect(reqRes._getStatusCode()).toBe(200);
        expect(mockMailService.sendMail).toHaveBeenCalledTimes(1);

        const mailArgs = (mockMailService.sendMail as jest.Mock).mock.calls[0][0];
        expect(mailArgs.to).toBe(testUser.email);
        expect(mailArgs.html).toContain('reset-password?token=');

        // Extract token from verification token table
        const user = await prisma.user.findUnique({ where: { email: testUser.email } });
        const vToken = await prisma.verificationToken.findFirst({
            where: { identifier: user?.id }
        });
        expect(vToken).toBeTruthy();
        const token = vToken!.token;

        // 2. Reset Password
        const newPassword = 'new-password-123';
        const resetBody = { token, password: newPassword };
        const resetSignature = generateSignature(resetBody, JWT_SECRET);

        const { req: resetReq, res: resetRes } = createMocks({
            method: 'POST',
            headers: { 'x-client-signature': resetSignature },
            body: resetBody
        });

        await resetPasswordHandler(resetReq as any, resetRes as any, prisma);
        expect(resetRes._getStatusCode()).toBe(200);

        // 3. Verify Old Password Fails
        const { req: oldLoginReq, res: oldLoginRes } = createMocks({
            method: 'POST',
            body: { email: testUser.email, password: testUser.password }
        });
        await loginHandler(oldLoginReq as any, oldLoginRes as any, { prisma });
        expect(oldLoginRes._getStatusCode()).toBe(401);

        // 4. Verify New Password Succeeds
        const { req: newLoginReq, res: newLoginRes } = createMocks({
            method: 'POST',
            body: { email: testUser.email, password: newPassword }
        });
        await loginHandler(newLoginReq as any, newLoginRes as any, { prisma });
        expect(newLoginRes._getStatusCode()).toBe(200);
        expect(JSON.parse(newLoginRes._getData()).token).toBeDefined();

        // 5. Verify token is consumed
        const vTokenAfter = await prisma.verificationToken.findUnique({ where: { token } });
        expect(vTokenAfter).toBeNull();

        // 6. Verify Token Replay Protection
        const replayRes = createMocks({
            method: 'POST',
            headers: { 'x-client-signature': resetSignature },
            body: resetBody
        });
        await resetPasswordHandler(replayRes.req as any, replayRes.res as any, prisma);
        expect(replayRes.res._getStatusCode()).toBe(400);
    });

    test('should_fail_reset_given_invalid_token', async () => {
        const resetBody = { token: 'invalid-token', password: 'new-password' };
        const resetSignature = generateSignature(resetBody, JWT_SECRET);

        const { req, res } = createMocks({
            method: 'POST',
            headers: { 'x-client-signature': resetSignature },
            body: resetBody
        });

        await resetPasswordHandler(req as any, res as any, prisma);
        expect(res._getStatusCode()).toBe(400);
    });

    test('should_fail_reset_given_expired_token', async () => {
        const user = await prisma.user.findUnique({ where: { email: testUser.email } });
        const token = 'expired-token';
        const expires = new Date(Date.now() - 3600000); // 1 hour ago

        await prisma.verificationToken.create({
            data: { identifier: user!.id, token, expires }
        });

        const resetBody = { token, password: 'new-password' };
        const resetSignature = generateSignature(resetBody, JWT_SECRET);

        const { req, res } = createMocks({
            method: 'POST',
            headers: { 'x-client-signature': resetSignature },
            body: resetBody
        });

        await resetPasswordHandler(req as any, res as any, prisma);
        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData()).message).toMatch(/expired/i);
    });
});
