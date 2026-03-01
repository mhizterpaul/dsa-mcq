import { MailService } from '../../../infra/mailService';
import { prisma as realPrisma } from '../../../infra/prisma/client';
import { PrismockClient } from 'prismock';
import { ensureIntegrationTestEnv } from '../setup';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');
jest.mock('googleapis', () => ({
    google: {
        auth: {
            OAuth2: jest.fn().mockImplementation(() => ({
                setCredentials: jest.fn(),
                getAccessToken: jest.fn().mockResolvedValue({ token: 'mock-access-token' }),
            })),
        },
    },
}));

/**
 * Integration test for Mail Service.
 */
describe('Mail Service Integration Test', () => {
    let mailService: MailService;
    let mockSendMail: jest.Mock;
    let prisma: any;

    beforeAll(() => {
        ensureIntegrationTestEnv();

        mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
        (nodemailer.createTransport as jest.Mock).mockReturnValue({
            sendMail: mockSendMail,
        });

        prisma = new PrismockClient();
        mailService = new MailService(prisma);
    });

    beforeEach(async () => {
        await prisma.outbox.deleteMany();
        mockSendMail.mockClear();
    });

    afterAll(async () => {
        await realPrisma.$disconnect();
    });

    it('should successfully send an email and not add to outbox', async () => {
        const mailOptions = {
            to: 'recipient@example.com',
            subject: 'Test Subject',
            html: '<p>Hello world from Gmail OAuth2!</p>',
        };

        await mailService.sendMail(mailOptions);

        expect(mockSendMail).toHaveBeenCalledWith(mailOptions);
        const outboxCount = await prisma.outbox.count();
        expect(outboxCount).toBe(0);
    });

    it('should add to outbox on transport failure', async () => {
        const error = new Error('Transport failed');
        mockSendMail.mockRejectedValueOnce(error);

        const mailOptions = {
            to: 'fail@example.com',
            subject: 'Failed Mail',
            html: '<p>Should fail</p>',
        };

        await expect(mailService.sendMail(mailOptions)).rejects.toThrow('Transport failed');

        const outboxEntry = await prisma.outbox.findFirst({
            where: { to: 'fail@example.com' }
        });

        expect(outboxEntry).toBeDefined();
        expect(outboxEntry?.error).toBe('Transport failed');
        expect(outboxEntry?.retries).toBe(0);
    });

    it('should successfully retry a failed email and remove it from outbox', async () => {
        const mailOptions = {
            to: `retry-success-${uuidv4()}@example.com`,
            subject: 'Retry Success',
            html: 'Content',
        };

        await prisma.outbox.create({
            data: {
                ...mailOptions,
                retries: 0,
                lastRetry: new Date(),
                error: 'Initial error',
            }
        });

        mockSendMail.mockResolvedValueOnce({ messageId: 'retry-id' });

        await mailService.retryFailedEmails();

        expect(mockSendMail).toHaveBeenCalled();
        const outboxEntry = await prisma.outbox.findFirst({
            where: { to: mailOptions.to }
        });
        expect(outboxEntry).toBeNull();
    });

    it('should increment retry count on continued failure', async () => {
        const mailOptions = {
            to: `retry-fail-${uuidv4()}@example.com`,
            subject: 'Retry Fail',
            html: 'Content',
        };

        await prisma.outbox.create({
            data: {
                ...mailOptions,
                retries: 0,
                lastRetry: new Date(),
                error: 'Initial error',
            }
        });

        mockSendMail.mockRejectedValueOnce(new Error('Still failing'));

        await mailService.retryFailedEmails();

        const outboxEntry = await prisma.outbox.findFirst({
            where: { to: mailOptions.to }
        });

        expect(outboxEntry).toBeDefined();
        expect(outboxEntry?.retries).toBe(1);
        expect(outboxEntry?.error).toBe('Still failing');
    });

    it('should not retry more than 3 times', async () => {
        const mailOptions = {
            to: `retry-limit-${uuidv4()}@example.com`,
            subject: 'Retry Limit',
            html: 'Content',
        };

        await prisma.outbox.create({
            data: {
                ...mailOptions,
                retries: 3,
                lastRetry: new Date(),
                error: 'Last error',
            }
        });

        await mailService.retryFailedEmails();

        expect(mockSendMail).not.toHaveBeenCalled();
        const outboxEntry = await prisma.outbox.findFirst({
            where: { to: mailOptions.to }
        });
        expect(outboxEntry).toBeDefined();
        expect(outboxEntry?.retries).toBe(3);
    });
});
