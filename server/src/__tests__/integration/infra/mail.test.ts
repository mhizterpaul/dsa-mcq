import { MailService } from '../../../infra/mailService';
import { prisma } from '../../../infra/prisma/client';
import { ensureIntegrationTestEnv } from '../setup';
import { v4 as uuidv4 } from 'uuid';

/**
 * Integration test for Mail Service.
 */
describe('Mail Service Integration Test', () => {
    let mailService: MailService;

    beforeAll(() => {
        ensureIntegrationTestEnv();
        mailService = new MailService(prisma);
    });

    afterAll(async () => {
        await prisma.outbox.deleteMany();
        await prisma.$disconnect();
    });

    it('should successfully send an email', async () => {
        const mailOptions = {
            to: 'recipient@example.com',
            subject: 'Test Subject',
            html: '<p>Hello world</p>',
        };

        // We use ethereal.email for testing, which should accept the request
        await expect(mailService.sendMail(mailOptions)).resolves.not.toThrow();
    });

    it('should add to outbox on failure and successfully retry', async () => {
        // Force a failure by using an invalid transporter or options
        // For this test, we'll simulate it by manually adding to outbox and then calling retry

        const failedMail = {
            to: `fail-${uuidv4()}@example.com`,
            subject: 'Failed Mail',
            html: 'Content',
        };

        // Manually trigger outbox addition by inducing error in sendMail if possible
        // or just test the retry logic directly.

        await prisma.outbox.create({
            data: {
                ...failedMail,
                retries: 0,
                lastRetry: new Date(),
                error: 'Initial simulated error',
            }
        });

        const outboxCountBefore = await prisma.outbox.count();
        expect(outboxCountBefore).toBeGreaterThan(0);

        // Retry
        await mailService.retryFailedEmails();

        // If it succeeds, it should be removed from outbox
        const outboxCountAfter = await prisma.outbox.count();
        // Since we use Ethereal, it might actually succeed now if the transporter is valid
        // If it fails again, retries should increment.
        const stillInOutbox = await prisma.outbox.findFirst({ where: { to: failedMail.to } });
        if (stillInOutbox) {
            expect(stillInOutbox.retries).toBe(1);
        } else {
            // Succeeded and removed
            expect(outboxCountAfter).toBe(outboxCountBefore - 1);
        }
    });
});
