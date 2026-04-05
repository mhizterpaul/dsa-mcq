import { QuizService } from '../../controllers/quizController';
import { prisma } from '../../infra/prisma/client';

describe('Scheduler Session Expiry Acceptance Scenario', () => {
    let quizService: QuizService;

    beforeEach(async () => {
        await prisma.quizParticipant.deleteMany();
        await prisma.quizSession.deleteMany();
        quizService = new QuizService(prisma);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    /**
     * @Doc("Scenario M: Quiz Session Expiry")
     */
    test('should_close_expired_sessions_given_scheduler_trigger', async () => {
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
    });
});
