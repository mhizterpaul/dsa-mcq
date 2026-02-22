import { createMocks } from 'node-mocks-http';
import sessionsHandler from '../../pages/api/daily-quiz/sessions';
import eventsHandler from '../../pages/api/daily-quiz/events';
import exitHandler from '../../pages/api/daily-quiz/exit';
import answerHandler from '../../pages/api/daily-quiz/answer';
import resultsHandler from '../../pages/api/daily-quiz/results';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';

jest.mock('../../infra/prisma/client');
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

const createToken = (user: any) => jwt.sign({ user }, JWT_SECRET);

const userA = { id: 'user-a', name: 'Alice', email: 'alice@example.com', image: 'avatar-a' };
const userB = { id: 'user-b', name: 'Bob', email: 'bob@example.com', image: 'avatar-b' };
const userC = { id: 'user-c', name: 'Charlie', email: 'charlie@example.com', image: 'avatar-c' };

const leaderboardA = { userId: 'user-a', rank: 10, xp: 1000, userHighestBadge: 'gold' };
const leaderboardB = { userId: 'user-b', rank: 15, xp: 1200, userHighestBadge: 'gold' }; // Similar to A
const leaderboardC = { userId: 'user-c', rank: 100, xp: 5000, userHighestBadge: 'bronze' }; // Not similar to A

describe('Daily Quiz Acceptance Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should be secured and reject unauthorized requests', async () => {
        const { req, res } = createMocks({ method: 'GET' });
        await sessionsHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });

    test('users with similar achievements are matched into the same session', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const session1 = { id: 'session-1', date: today, participants: [] };

        // Mocking user A finding/creating session
        mockedPrisma.quizSession.findMany
            .mockResolvedValueOnce([])
            .mockResolvedValue([{ ...session1, participants: [] }]);
        mockedPrisma.leaderboard.findUnique.mockResolvedValue(leaderboardA);
        mockedPrisma.quizSession.create.mockResolvedValue({ ...session1, participants: [] });
        mockedPrisma.quizParticipant.findUnique.mockResolvedValue(null);
        mockedPrisma.quizParticipant.count.mockResolvedValue(0);
        mockedPrisma.quizParticipant.create.mockResolvedValue({ userId: 'user-a', sessionId: 'session-1' });
        mockedPrisma.quizParticipant.findMany.mockResolvedValue([{ user: userA }]);

        const tokenA = createToken(userA);
        const { req: reqA, res: resA } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${tokenA}` }
        });

        await sessionsHandler(reqA, resA);
        expect(resA._getStatusCode()).toBe(200);
        const dataA = JSON.parse(resA._getData());
        expect(dataA.id).toBe('session-1');

        // Mocking user B (similar to A) joining the same session
        mockedPrisma.quizSession.findMany.mockResolvedValue([{
            ...session1,
            participants: [{ user: { ...userA, leaderboard: leaderboardA } }]
        }]);
        mockedPrisma.leaderboard.findUnique.mockResolvedValue(leaderboardB);
        mockedPrisma.quizParticipant.findUnique.mockResolvedValue(null);
        mockedPrisma.quizParticipant.count.mockResolvedValue(1);
        mockedPrisma.quizParticipant.create.mockResolvedValue({ userId: 'user-b', sessionId: 'session-1' });
        mockedPrisma.quizParticipant.findMany.mockResolvedValue([{ user: userA }, { user: userB }]);

        const tokenB = createToken(userB);
        const { req: reqB, res: resB } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${tokenB}` }
        });

        await sessionsHandler(reqB, resB);
        expect(resB._getStatusCode()).toBe(200);
        const dataB = JSON.parse(resB._getData());
        expect(dataB.id).toBe('session-1');

        // Mocking user C (NOT similar to A) creating a NEW session
        mockedPrisma.quizSession.findMany.mockResolvedValue([{
            ...session1,
            participants: [{ user: { ...userA, leaderboard: leaderboardA } }]
        }]);
        mockedPrisma.leaderboard.findUnique.mockResolvedValue(leaderboardC);
        const session2 = { id: 'session-2', date: today, participants: [] };
        mockedPrisma.quizSession.create.mockResolvedValue({ ...session2, participants: [] });
        mockedPrisma.quizParticipant.create.mockResolvedValue({ userId: 'user-c', sessionId: 'session-2' });
        mockedPrisma.quizParticipant.findMany.mockResolvedValue([{ user: userC }]);

        const tokenC = createToken(userC);
        const { req: reqC, res: resC } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${tokenC}` }
        });

        await sessionsHandler(reqC, resC);
        expect(resC._getStatusCode()).toBe(200);
        const dataC = JSON.parse(resC._getData());
        expect(dataC.id).toBe('session-2');
    });

    test('SSE connection and participant updates', async () => {
        const session = { id: 'session-123', participants: [] };
        mockedPrisma.quizSession.findMany.mockResolvedValue([session]);
        mockedPrisma.quizParticipant.findMany.mockResolvedValue([{ user: userA }, { user: userB }]);
        mockedPrisma.leaderboard.findUnique.mockResolvedValue(null);

        const tokenA = createToken(userA);
        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${tokenA}` }
        });

        res.write = jest.fn();
        res.flushHeaders = jest.fn();

        await eventsHandler(req, res);

        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"type":"connected"'));

        // Simulate another user joining
        mockedPrisma.quizParticipant.findUnique.mockResolvedValue(null);
        mockedPrisma.quizParticipant.count.mockResolvedValue(1);
        mockedPrisma.quizParticipant.create.mockResolvedValue({ userId: 'user-b', sessionId: 'session-123' });
        mockedPrisma.quizParticipant.findMany.mockResolvedValue([{ user: userA }, { user: userB }]);

        const tokenB = createToken(userB);
        const { req: reqB, res: resB } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${tokenB}` }
        });

        await sessionsHandler(reqB, resB);

        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"type":"participant_update"'));
        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('Bob'));
    });

    test('user cannot exit after joining until session end', async () => {
        const activeSession = { id: 's1', endTime: null, participants: [] };
        mockedPrisma.quizSession.findMany.mockResolvedValue([activeSession]);
        mockedPrisma.quizSession.findUnique.mockResolvedValue(activeSession);
        mockedPrisma.leaderboard.findUnique.mockResolvedValue(null);

        const tokenA = createToken(userA);
        const { req, res } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${tokenA}` }
        });

        await exitHandler(req, res);
        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData()).message).toContain('cannot exit');

        // After session end
        const endedSession = { id: 's1', endTime: new Date(), participants: [] };
        mockedPrisma.quizSession.findUnique.mockResolvedValue(endedSession);
        mockedPrisma.quizParticipant.delete.mockResolvedValue({} as any);
        mockedPrisma.quizParticipant.findMany.mockResolvedValue([]);

        const { req: req2, res: res2 } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${tokenA}` }
        });
        await exitHandler(req2, res2);
        expect(res2._getStatusCode()).toBe(200);
    });

    test('user is notified when session available after failure', async () => {
        // Fill up sessions
        const fullSessions = Array.from({ length: 10 }, (_, i) => ({ id: `${i}`, participants: Array(5).fill({}) }));
        mockedPrisma.quizSession.findMany.mockResolvedValue(fullSessions);
        mockedPrisma.leaderboard.findUnique.mockResolvedValue(null);

        const tokenA = createToken(userA);
        const { req: reqEv, res: resEv } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${tokenA}` }
        });
        resEv.write = jest.fn();

        await eventsHandler(reqEv, resEv);
        expect(resEv.write).toHaveBeenCalledWith(expect.stringContaining('"type":"waiting"'));

        // Now a session becomes available
        mockedPrisma.quizSession.findMany.mockResolvedValue([]);
        mockedPrisma.quizSession.create.mockResolvedValue({ id: 'new-session', participants: [] });
        mockedPrisma.quizParticipant.findUnique.mockResolvedValue(null);
        mockedPrisma.quizParticipant.count.mockResolvedValue(0);
        mockedPrisma.quizParticipant.create.mockResolvedValue({ userId: 'user-b', sessionId: 'new-session' });
        mockedPrisma.quizParticipant.findMany.mockResolvedValue([{ user: userB }]);

        const tokenB = createToken(userB);
        const { req: reqS, res: resS } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${tokenB}` }
        });
        await sessionsHandler(reqS, resS);

        expect(resEv.write).toHaveBeenCalledWith(expect.stringContaining('"type":"session_available"'));
    });

    test('integrity of quiz session and data persistence', async () => {
        const session = { id: 's1', endTime: null, participants: [] };
        mockedPrisma.quizSession.findFirst.mockResolvedValue(session);
        mockedPrisma.quizParticipant.findUnique.mockResolvedValue({ id: 'p1', userId: 'user-a', sessionId: 's1', score: 0 });
        mockedPrisma.question.findUnique.mockResolvedValue({ id: 1, correct: 'A' } as any);
        mockedPrisma.quizParticipant.update.mockResolvedValue({} as any);
        mockedPrisma.userQuestionData.upsert.mockResolvedValue({} as any);
        mockedPrisma.engagement.upsert.mockResolvedValue({} as any);

        const tokenA = createToken(userA);
        const { req, res } = createMocks({
            method: 'POST',
            headers: { authorization: `Bearer ${tokenA}` },
            body: { questionId: 1, answer: 'A' }
        });

        await answerHandler(req, res);
        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData()).isCorrect).toBe(true);

        expect(mockedPrisma.quizParticipant.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ score: 10 })
        }));

        expect(mockedPrisma.userQuestionData.upsert).toHaveBeenCalledWith(expect.objectContaining({
            where: { userId_questionId: { userId: 'user-a', questionId: 1 } },
            create: expect.objectContaining({ correct: true })
        }));

        expect(mockedPrisma.engagement.upsert).toHaveBeenCalledWith(expect.objectContaining({
            where: { userId: 'user-a' },
            update: { xp: { increment: 10 } }
        }));
    });
});
