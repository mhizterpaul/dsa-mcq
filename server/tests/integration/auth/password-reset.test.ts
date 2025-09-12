import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { requestPasswordResetHandler } from '../../src/pages/api/auth/request-password-reset';
import { resetPasswordHandler } from '../../src/pages/api/auth/reset-password';
import { PrismockClient } from 'prismock';
import argon2 from 'argon2';
import { MailService } from '../../src/services/mailService';
import { generateSignature } from '../../src/utils/signature';

// Mock MailService
jest.mock('../../src/services/mailService');
const MockMailService = MailService as jest.MockedClass<typeof MailService>;

describe('/api/auth/password-reset', () => {
    let prismock: PrismockClient;
    let mailService: jest.Mocked<MailService>;

    beforeAll(() => {
        prismock = new PrismockClient() as unknown as PrismockClient;
        // @ts-ignore
        mailService = new MockMailService();
    });

    beforeEach(async () => {
        await prismock.user.deleteMany({});
        await prismock.verificationToken.deleteMany({});
    });

    const makeReqRes = (method: 'POST' | 'GET', options: { query?: any, body?: any, url?: string } = {}) => {
        const { req, res } = createMocks({ method, ...options });
        const signature = generateSignature(options.body || {});
        req.headers = { 'x-client-signature': signature };
        return { req: req as NextApiRequest, res: res as NextApiResponse };
    };

    it('should request a password reset and then reset the password', async () => {
        const email = 'reset-user@example.com';
        const password = 'password123';
        const newPassword = 'newPassword456';
        const hashedPassword = await argon2.hash(password);

        const user = await prismock.user.create({
            data: {
                email,
                name: 'Reset User',
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });

        // Request password reset
        const resetBody = { email };
        const { req: reqReset, res: resReset } = makeReqRes('POST', { body: resetBody });
        await requestPasswordResetHandler(reqReset, resReset, prismock, mailService);
        expect(resReset._getStatusCode()).toBe(200);

        const verificationToken = await prismock.verificationToken.findFirst({
            where: { identifier: user.id },
        });
        expect(verificationToken).not.toBeNull();

        // Reset password
        const newPassBody = { token: verificationToken!.token, password: newPassword };
        const { req: reqNewPass, res: resNewPass } = makeReqRes('POST', {
            body: newPassBody,
        });
        await resetPasswordHandler(reqNewPass, resNewPass, prismock);
        expect(resNewPass._getStatusCode()).toBe(200);

        const updatedUser = await prismock.user.findUnique({ where: { email } });
        const passwordMatch = await argon2.verify(updatedUser!.password!, newPassword);
        expect(passwordMatch).toBe(true);
    });
});
