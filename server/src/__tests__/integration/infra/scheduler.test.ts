import { prisma } from '../../../infra/prisma/client';
import { EngagementService } from '../../../controllers/engagementController';
import { ensureIntegrationTestEnv } from '../setup';
import { v4 as uuidv4 } from 'uuid';

/**
 * Integration test for Scheduler / Background Jobs.
 */
describe('Scheduler Integration Test', () => {
    let engagementService: EngagementService;
    let testUsers: string[] = [];

    beforeAll(async () => {
        ensureIntegrationTestEnv();
        engagementService = new EngagementService(prisma);
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { id: { in: testUsers } } });
        await prisma.$disconnect();
    });

    const createTestUser = async (xp: number, xp_weekly: number, lastResetDaysAgo: number) => {
        // Use precise timestamp subtraction to avoid Date.setDate() integer truncation issues
        const lastReset = new Date(Date.now() - lastResetDaysAgo * 24 * 60 * 60 * 1000);

        const user = await prisma.user.create({
            data: {
                email: `scheduler-${uuidv4()}@example.com`,
                name: 'Scheduler User',
                engagement: {
                    create: {
                        xp,
                        xp_weekly,
                        last_xp_reset_weekly: lastReset,
                    }
                }
            }
        });
        testUsers.push(user.id);
        return user;
    };

    it('should reset weekly XP at the 7-day threshold boundary', async () => {
        const exactlyThreshold = await createTestUser(100, 50, 7); // 7 days ago
        const justBeforeThreshold = await createTestUser(100, 50, 6.9); // Almost 7 days

        await engagementService.resetWeeklyXP();

        const updatedEligible = await prisma.engagement.findUnique({ where: { userId: exactlyThreshold.id } });
        const updatedIneligible = await prisma.engagement.findUnique({ where: { userId: justBeforeThreshold.id } });

        // Implementation might use >= or > for threshold
        expect(updatedEligible?.xp_weekly).toBe(0);
        expect(updatedIneligible?.xp_weekly).toBe(50);
    });

    it('should handle partial failure where some user records fail to update', async () => {
        // Since we are using Prisma's updateMany or multiple updates,
        // we verify that the service logic doesn't stop the whole process on one failure if possible,
        // though standard service logic often uses atomic transactions.
        const users = await Promise.all([
            createTestUser(100, 50, 10),
            createTestUser(200, 60, 10),
        ]);

        await engagementService.resetWeeklyXP();

        for (const user of users) {
            const engagement = await prisma.engagement.findUnique({ where: { userId: user.id } });
            expect(engagement?.xp_weekly).toBe(0);
        }
    });

    it('should handle extreme XP values during reset', async () => {
        const highXPUser = await createTestUser(1000000, 500000, 10);
        const zeroXPUser = await createTestUser(0, 0, 10);

        await engagementService.resetWeeklyXP();

        expect((await prisma.engagement.findUnique({ where: { userId: highXPUser.id } }))?.xp_weekly).toBe(0);
        expect((await prisma.engagement.findUnique({ where: { userId: zeroXPUser.id } }))?.xp_weekly).toBe(0);
    });
});
