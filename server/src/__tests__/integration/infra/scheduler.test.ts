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

    const createTestUser = async (xp: number, xp_weekly: number, lastResetWeeksAgo: number) => {
        const lastReset = new Date();
        lastReset.setDate(lastReset.getDate() - (lastResetWeeksAgo * 7));

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

    it('should reset weekly XP only for eligible users (expired)', async () => {
        const eligibleUser = await createTestUser(1000, 500, 2); // 2 weeks ago
        const ineligibleUser = await createTestUser(1000, 300, 0); // today

        await engagementService.resetWeeklyXP();

        const updatedEligible = await prisma.engagement.findUnique({ where: { userId: eligibleUser.id } });
        const updatedIneligible = await prisma.engagement.findUnique({ where: { userId: ineligibleUser.id } });

        expect(updatedEligible?.xp_weekly).toBe(0);
        expect(updatedIneligible?.xp_weekly).toBe(300);
    });

    it('should be idempotent', async () => {
        const user = await createTestUser(1000, 500, 2);

        // Run once
        await engagementService.resetWeeklyXP();
        const firstRun = await prisma.engagement.findUnique({ where: { userId: user.id } });
        expect(firstRun?.xp_weekly).toBe(0);

        // Run again
        await engagementService.resetWeeklyXP();
        const secondRun = await prisma.engagement.findUnique({ where: { userId: user.id } });
        expect(secondRun?.xp_weekly).toBe(0);
    });

    it('should handle multi-user scenarios correctly', async () => {
        const users = await Promise.all([
            createTestUser(100, 50, 2),
            createTestUser(200, 60, 2),
            createTestUser(300, 70, 2),
        ]);

        await engagementService.resetWeeklyXP();

        for (const user of users) {
            const engagement = await prisma.engagement.findUnique({ where: { userId: user.id } });
            expect(engagement?.xp_weekly).toBe(0);
        }
    });
});
