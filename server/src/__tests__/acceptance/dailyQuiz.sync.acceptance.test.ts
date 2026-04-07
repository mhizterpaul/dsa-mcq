import { createMocks } from 'node-mocks-http';
import { stateHandler } from '../../pages/api/daily-quiz/state';
import { QuizService } from '../../controllers/quizController';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

class Actor {
    static user(user: { id: string; email: string; name: string }) {
        const sessionId = `sess-${user.id}`;
        const token = jwt.sign({ user: { id: user.id }, sessionId }, JWT_SECRET);
        return { ...user, token, sessionId };
    }
}

describe('Polling Sync Consistency & Long Polling', () => {
    const userA = { id: 'user-a', email: 'a@test.com', name: 'Alice' };
    let actorA: ReturnType<typeof Actor.user>;

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
        actorA = Actor.user(userA);
        await prisma.session.create({
            data: {
                id: actorA.sessionId,
                userId: userA.id,
                sessionToken: actorA.token,
                expires: new Date(Date.now() + 3600000)
            }
        });
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

        const service = new QuizService(prisma);
        const qSession = await service.getOrCreateDailyQuizSession(actorA);
        if (!qSession) throw new Error('Session creation failed');

        const currentVersion = qSession.updatedAt ? qSession.updatedAt.getTime() : 0;
        await service.findOrCreateParticipant(qSession, actorA);

        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${actorA.token}` },
            query: { version: currentVersion.toString() }
        });

        // Use a shorter timeout for test if possible, or just wait
        const start = Date.now();
        await stateHandler(req as any, res as any, service);
        const duration = Date.now() - start;

        expect(res._getStatusCode()).toBe(304);
        expect(duration).toBeGreaterThanOrEqual(5000);
    }, 10000);

    /**
     * @Doc("Scenario I: Polling Synchronization Consistency")
     * @Route("/api/daily-quiz/state")
     */
    test('should_return_new_state_immediately_given_version_mismatch', async () => {
        const service = new QuizService(prisma);
        const qSession = await service.getOrCreateDailyQuizSession(actorA);
        if (!qSession) throw new Error('Session creation failed');

        await service.findOrCreateParticipant(qSession, actorA);
        const currentVersion = qSession.updatedAt ? qSession.updatedAt.getTime() : 0;

        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${actorA.token}` },
            query: { version: (currentVersion - 1000).toString() } // mismatch
        });

        const start = Date.now();
        await stateHandler(req as any, res as any, service);
        const duration = Date.now() - start;

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.version).toBe(currentVersion);
        expect(duration).toBeLessThan(1000); // Should return immediately
    });

    test('should_return_WAITING_immediately_if_lastVersion_is_0_and_no_session', async () => {
        // Ensure no sessions exist
        await prisma.quizSession.deleteMany();

        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${actorA.token}` },
            query: { version: '0' }
        });

        // We need to prevent the controller from creating a session automatically for this test
        // Let's mock sessions.length >= 10 logic by filling sessions with 5 participants each
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for(let i=0; i<10; i++) {
            const qSess = await prisma.quizSession.create({ data: { date: today, startTime: new Date() } });
            for(let j=0; j<5; j++) {
                const u = await prisma.user.create({ data: { email: `user-${i}-${j}@test.com`, name: `User ${i}-${j}` } });
                await prisma.quizParticipant.create({ data: { userId: u.id, sessionId: qSess.id } });
            }
        }

        await stateHandler(req as any, res as any, new QuizService(prisma));
        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.status).toBe('WAITING');
    });

    test('should_reject_request_without_token', async () => {
        const { req, res } = createMocks({ method: 'GET' });
        await stateHandler(req as any, res as any, new QuizService(prisma));
        expect(res._getStatusCode()).toBe(401);
    });

    test('should_reject_invalid_token', async () => {
        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: 'Bearer invalid' }
        });
        await stateHandler(req as any, res as any, new QuizService(prisma));
        expect(res._getStatusCode()).toBe(401);
    });

    test('should_return_200_if_state_changes_during_poll', async () => {
        const service = new QuizService(prisma);
        const qSession = await service.getOrCreateDailyQuizSession(actorA);
        if (!qSession) throw new Error('Session creation failed');

        await service.findOrCreateParticipant(qSession, actorA);
        const currentVersion = qSession.updatedAt ? qSession.updatedAt.getTime() : 0;

        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${actorA.token}` },
            query: { version: currentVersion.toString() }
        });

        // Trigger state change after 1 second
        setTimeout(async () => {
            await prisma.quizSession.update({
                where: { id: qSession.id },
                data: { updatedAt: new Date() }
            });
        }, 1000);

        const start = Date.now();
        await stateHandler(req as any, res as any, service);
        const duration = Date.now() - start;

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.version).toBeGreaterThan(currentVersion);
        expect(duration).toBeLessThan(5000);
    });
});
