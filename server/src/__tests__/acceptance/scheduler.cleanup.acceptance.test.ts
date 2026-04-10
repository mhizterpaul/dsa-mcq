import { QuizService } from '../../controllers/quizController';
import { EngagementService } from '../../controllers/engagementController';
import { MaintenanceSchedulerAdapter } from '../../adapters/MaintenanceSchedulerAdapter';
import { prisma } from '../../infra/prisma/client';

describe('Scheduler Acceptance Scenario (Orchestrated)', () => {
    let quizService: QuizService;
    let engagementService: EngagementService;
    let scheduler: MaintenanceSchedulerAdapter;

    beforeEach(async () => {
        await prisma.auditLog.deleteMany();
        await prisma.engagement.deleteMany();
        await prisma.quizParticipant.deleteMany();
        await prisma.quizSession.deleteMany();
        await prisma.user.deleteMany();

        quizService = new QuizService(prisma);
        engagementService = new EngagementService(prisma);
        scheduler = new MaintenanceSchedulerAdapter(quizService, engagementService);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    /**
     * @Doc("Scenario M: Quiz Session Expiry & Weekly Stats Reset via Scheduler Adapter")
     */
    test('should_reset_daily_stats_given_scheduler_trigger', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Setup stale session using service API
        const staleStartTime = new Date(Date.now() - 360000);
        const staleSession = await quizService.createSession({ date: today, startTime: staleStartTime });

        // 2. Setup fresh session using service API
        const freshStartTime = new Date(Date.now() - 60000);
        const freshSession = await quizService.createSession({ date: today, startTime: freshStartTime });

        // 3. Setup Weekly King candidate
        const user = await prisma.user.create({ data: { email: 'king@test.com', name: 'Weekly King' } });
        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

        await prisma.engagement.create({
            data: {
                userId: user.id,
                xp_weekly: 500,
                last_xp_reset_weekly: eightDaysAgo
            }
        });

        // 4. Trigger maintenance via orchestration boundary
        await scheduler.runDailyMaintenance();

        // 5. Verify outcomes
        const staleAfter = await prisma.quizSession.findUnique({ where: { id: staleSession.id } });
        expect(staleAfter?.endTime).not.toBeNull();

        const freshAfter = await prisma.quizSession.findUnique({ where: { id: freshSession.id } });
        expect(freshAfter?.endTime).toBeNull();

        const engagement = await prisma.engagement.findUnique({ where: { userId: user.id } });
        expect(engagement?.xp_weekly).toBe(0);

        // 6. Verify Audit Logs
        const cleanupAudit = await prisma.auditLog.findFirst({ where: { action: 'EXPIRED_SESSIONS_CLEANUP' } });
        expect(cleanupAudit).toBeDefined();

        const xpResetAudit = await prisma.auditLog.findFirst({ where: { action: 'WEEKLY_XP_RESET' } });
        expect(xpResetAudit).toBeDefined();

        const kingResetAudit = await prisma.auditLog.findFirst({ where: { action: 'DAILY_KING_RESET' } });
        expect(kingResetAudit).toBeDefined();
    });
});
