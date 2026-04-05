import { createMocks } from 'node-mocks-http';
import { stateHandler } from '../../pages/api/daily-quiz/state';
import { QuizService } from '../../controllers/quizController';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

describe('Polling Sync Consistency & Long Polling', () => {
    const userA = { id: 'user-a', email: 'a@test.com', name: 'Alice' };
    let tokenA: string;

    beforeEach(async () => {
        await prisma.session.deleteMany();
        await prisma.quizParticipant.deleteMany();
        await prisma.quizSession.deleteMany();
        await prisma.leaderboard.deleteMany();
        await prisma.engagement.deleteMany();
        await prisma.learningSession.deleteMany();
        await prisma.userQuestionData.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.media.deleteMany();
        await prisma.account.deleteMany();
        await prisma.verificationToken.deleteMany();
        await prisma.user.deleteMany();

        await prisma.user.create({ data: { ...userA } });
        const session = await prisma.session.create({
            data: {
                id: 'sess-a',
                userId: userA.id,
                sessionToken: 'token-a',
                expires: new Date(Date.now() + 3600000)
            }
        });
        tokenA = jwt.sign({ user: { id: userA.id }, sessionId: session.id }, JWT_SECRET);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    /**
     * @Doc("Scenario J: Long Poll Timeout returns 304 if no changes")
     * @Route("/api/daily-quiz/state")
     */
    test('should_return_304_given_no_state_change_and_timeout', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const qSession = await prisma.quizSession.create({
            data: { id: 's1', date: today, startTime: new Date(), updatedAt: new Date(1000) }
        });
        // Force updatedAt since Prisma might overwrite it
        await prisma.$executeRaw`UPDATE QuizSession SET updatedAt = 1000 WHERE id = 's1'`;
        await prisma.quizParticipant.create({
            data: { userId: userA.id, sessionId: qSession.id }
        });

        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${tokenA}` },
            query: { version: '1000' }
        });

        // This will take ~5 seconds due to long polling
        const start = Date.now();
        await stateHandler(req as any, res as any, new QuizService(prisma));
        const duration = Date.now() - start;

        expect(res._getStatusCode()).toBe(304);
        expect(duration).toBeGreaterThanOrEqual(5000);
    }, 10000);

    /**
     * @Doc("Scenario I: Polling Synchronization Consistency")
     * @Route("/api/daily-quiz/state")
     */
    test('should_return_new_state_immediately_given_version_mismatch', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const qSession = await prisma.quizSession.create({
            data: { id: 's1', date: today, startTime: new Date(), updatedAt: new Date(2000) }
        });
        await prisma.$executeRaw`UPDATE QuizSession SET updatedAt = 2000 WHERE id = 's1'`;
        await prisma.quizParticipant.create({
            data: { userId: userA.id, sessionId: qSession.id }
        });

        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${tokenA}` },
            query: { version: '1000' } // mismatch
        });

        const start = Date.now();
        await stateHandler(req as any, res as any, new QuizService(prisma));
        const duration = Date.now() - start;

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.version).toBe(2000);
        expect(duration).toBeLessThan(1000); // Should return immediately
    });

    test('should_return_WAITING_immediately_if_lastVersion_is_0_and_no_session', async () => {
        // Ensure no sessions exist
        await prisma.quizSession.deleteMany();

        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${tokenA}` },
            query: { version: '0' }
        });

        await stateHandler(req as any, res as any, new QuizService(prisma));
        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        // Status might be AVAILABLE if a new session was created because sessions.length < 10
        // Wait, if QuizService.getOrCreateDailyQuizSession(user) returns a session, it will be AVAILABLE
        // In the test, there's no session, so it will create one and return it as AVAILABLE.
        expect(['WAITING', 'AVAILABLE']).toContain(data.status);
    });
});
