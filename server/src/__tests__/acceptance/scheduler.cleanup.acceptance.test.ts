import { QuizService } from '../../controllers/quizController';
import { EngagementService } from '../../controllers/engagementController';
import { prisma } from '../../infra/prisma/client';

describe('Scheduler Session Expiry and Stats Reset Acceptance Scenario', () => {
    let quizService: QuizService;
    let engagementService: EngagementService;

    beforeEach(async () => {
        await prisma.engagement.deleteMany();
        await prisma.quizParticipant.deleteMany();
        await prisma.quizSession.deleteMany();
        await prisma.user.deleteMany();

        quizService = new QuizService(prisma);
        engagementService = new EngagementService(prisma);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    /**
     * @Doc("Scenario M: Quiz Session Expiry & Weekly Stats Reset")
     */
    test('should_close_expired_sessions_and_reset_weekly_stats_given_scheduler_trigger', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Create a stale session (started 6 minutes ago)
        const staleStartTime = new Date(Date.now() - 360000);
        const staleSession = await prisma.quizSession.create({
            data: { id: 'stale-1', date: today, startTime: staleStartTime }
        });

        // 2. Create a fresh session (started 1 minute ago)
        const freshStartTime = new Date(Date.now() - 60000);
        const freshSession = await prisma.quizSession.create({
            data: { id: 'fresh-1', date: today, startTime: freshStartTime }
        });

        // 3. Run cleanup
        const cleanedCount = await quizService.cleanupExpiredSessions();
        expect(cleanedCount).toBe(1);

        // 4. Verify stale session is closed
        const staleAfter = await prisma.quizSession.findUnique({ where: { id: 'stale-1' } });
        expect(staleAfter?.endTime).not.toBeNull();

        // 5. Verify fresh session is still open
        const freshAfter = await prisma.quizSession.findUnique({ where: { id: 'fresh-1' } });
        expect(freshAfter?.endTime || null).toBeNull();

        // 6. Test Weekly Stats Reset
        const user = await prisma.user.create({ data: { email: 'king@test.com', name: 'Weekly King' } });
        // Set last reset to 8 days ago so it triggers
        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

        await prisma.engagement.create({
            data: {
                userId: user.id,
                xp_weekly: 500,
                last_xp_reset_weekly: eightDaysAgo
            }
        });

        // Trigger reset
        await engagementService.resetWeeklyXP();

        // Verify reset
        const engagementAfter = await prisma.engagement.findUnique({ where: { userId: user.id } });
        expect(engagementAfter?.xp_weekly).toBe(0);
        expect(engagementAfter?.last_xp_reset_weekly.getTime()).toBeGreaterThan(eightDaysAgo.getTime());
    });
});
