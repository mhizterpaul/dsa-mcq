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

    it('should initialize transporter only once during instantiation', () => {
        expect(nodemailer.createTransport).toHaveBeenCalled();
    });

    it('should successfully send an email, return messageId, and not add to outbox', async () => {
        const mailOptions = {
            to: 'recipient@example.com',
            subject: 'Test Subject',
            html: '<p>Hello world from Gmail OAuth2!</p>',
        };

        const result = await mailService.sendMail(mailOptions);

        expect(result.messageId).toBe('test-id');
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

    it('should not retry more than MAX_RETRIES times', async () => {
        const mailOptions = {
            to: `retry-limit-${uuidv4()}@example.com`,
            subject: 'Retry Limit',
            html: 'Content',
        };

        await prisma.outbox.create({
            data: {
                ...mailOptions,
                retries: MailService.MAX_RETRIES,
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
        expect(outboxEntry?.retries).toBe(MailService.MAX_RETRIES);
    });

    it('should process multiple outbox entries correctly (batch processing)', async () => {
        // Entry 1: Success on retry
        const mail1 = { to: 'success@example.com', subject: 'S1', html: 'H1' };
        await prisma.outbox.create({ data: { ...mail1, retries: 0, lastRetry: new Date(), error: 'E1' } });

        // Entry 2: Failure on retry
        const mail2 = { to: 'fail@example.com', subject: 'S2', html: 'H2' };
        await prisma.outbox.create({ data: { ...mail2, retries: 1, lastRetry: new Date(), error: 'E2' } });

        // Entry 3: Already at max retries
        const mail3 = { to: 'max@example.com', subject: 'S3', html: 'H3' };
        await prisma.outbox.create({ data: { ...mail3, retries: MailService.MAX_RETRIES, lastRetry: new Date(), error: 'E3' } });

        mockSendMail
            .mockResolvedValueOnce({ messageId: 'id1' })
            .mockRejectedValueOnce(new Error('Persistent error'));

        await mailService.retryFailedEmails();

        expect(mockSendMail).toHaveBeenCalledTimes(2);

        const outboxEntries = await prisma.outbox.findMany();
        expect(outboxEntries).toHaveLength(2);

        const entry2 = outboxEntries.find(e => e.to === 'fail@example.com');
        expect(entry2?.retries).toBe(2);
        expect(entry2?.error).toBe('Persistent error');

        const entry3 = outboxEntries.find(e => e.to === 'max@example.com');
        expect(entry3?.retries).toBe(MailService.MAX_RETRIES);
    });
});
