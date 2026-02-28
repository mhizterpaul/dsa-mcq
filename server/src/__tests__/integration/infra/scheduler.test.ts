import { prisma } from '../../../infra/prisma/client';
import { EngagementService } from '../../../controllers/engagementController';

/**
 * Integration test for Scheduler / Background Jobs.
 * We simulate the job trigger by calling the service methods directly
 * and verifying the side effects in the database.
 */
describe('Scheduler Integration Test', () => {
    let engagementService: EngagementService;
    let testUserId: string;

    beforeAll(async () => {
        engagementService = new EngagementService(prisma);

        // Create a test user with some XP
        const user = await prisma.user.create({
            data: {
                email: `scheduler-test-${Date.now()}@example.com`,
                name: 'Scheduler Test User',
                engagement: {
                    create: {
                        xp: 1000,
                        xp_weekly: 500,
                        xp_monthly: 800,
                        last_xp_reset_weekly: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
                    }
                }
            },
            include: { engagement: true }
        });
        testUserId = user.id;
    });

    afterAll(async () => {
        await prisma.user.delete({ where: { id: testUserId } });
        await prisma.$disconnect();
    });

    it('should reset weekly XP when the weekly job is triggered', async () => {
        // Trigger the logic that the scheduler would run
        await engagementService.resetWeeklyXP();

        const engagement = await prisma.engagement.findUnique({
            where: { userId: testUserId }
        });

        expect(engagement?.xp_weekly).toBe(0);
        expect(engagement?.xp).toBe(1000); // Total XP should remain
    });

    it('should reset monthly XP when the monthly job is triggered', async () => {
        await engagementService.resetMonthlyXP();

        const engagement = await prisma.engagement.findUnique({
            where: { userId: testUserId }
        });

        expect(engagement?.xp_monthly).toBe(0);
    });
});
