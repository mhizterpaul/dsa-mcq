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

const createToken = (user: any, options = {}) => jwt.sign({ user }, JWT_SECRET, options);

const userA = { id: 'user-a', name: 'Alice', email: 'alice@example.com', image: 'avatar-a' };
const userB = { id: 'user-b', name: 'Bob', email: 'bob@example.com', image: 'avatar-b' };
const userC = { id: 'user-c', name: 'Charlie', email: 'charlie@example.com', image: 'avatar-c' };

const leaderboardA = { userId: 'user-a', rank: 10, xp: 1000, userHighestBadge: 'gold' };
const leaderboardB = { userId: 'user-b', rank: 15, xp: 1200, userHighestBadge: 'gold' };
const leaderboardC = { userId: 'user-c', rank: 100, xp: 5000, userHighestBadge: 'bronze' };

describe('Daily Quiz Acceptance Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Security & Authorization', () => {
        test.each([
            ['sessions', sessionsHandler],
            ['events', eventsHandler],
            ['answer', answerHandler],
            ['exit', exitHandler],
            ['results', resultsHandler]
        ])('%s endpoint rejects unauthenticated requests', async (_, handler) => {
            const { req, res } = createMocks({ method: 'GET' });
            await handler(req, res);
            expect(res._getStatusCode()).toBe(401);
        });

        test('rejects expired tokens', async () => {
            const expiredToken = createToken(userA, { expiresIn: '-1s' });
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${expiredToken}` }
            });
            await sessionsHandler(req, res);
            expect(res._getStatusCode()).toBe(401);
        });

        test('rejects malformed tokens', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer not-a-token` }
            });
            await sessionsHandler(req, res);
            expect(res._getStatusCode()).toBe(401);
        });

        test('rejects tokens with invalid signature', async () => {
            const badToken = jwt.sign({ user: userA }, 'wrong-secret');
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${badToken}` }
            });
            await sessionsHandler(req, res);
            expect(res._getStatusCode()).toBe(401);
        });
    });

    describe('Session Matching & Capacity', () => {
        test('users with similar achievements are matched into the same session', async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const session1 = { id: 'session-1', date: today, participants: [] };

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

            mockedPrisma.quizSession.findMany.mockResolvedValue([{
                ...session1,
                participants: [{ user: { ...userA, leaderboard: leaderboardA } }]
            }]);
            mockedPrisma.leaderboard.findUnique.mockResolvedValue(leaderboardB);
            mockedPrisma.quizParticipant.count.mockResolvedValue(1);

            const tokenB = createToken(userB);
            const { req: reqB, res: resB } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenB}` }
            });

            await sessionsHandler(reqB, resB);
            expect(resB._getStatusCode()).toBe(200);
            expect(JSON.parse(resB._getData()).id).toBe('session-1');
        });

        test('enforces 2-5 participants per session (rejects 6th)', async () => {
            const session = { id: 'full-session', participants: Array(5).fill({}) };
            mockedPrisma.quizSession.findMany.mockResolvedValue([session]);
            mockedPrisma.leaderboard.findUnique.mockResolvedValue(leaderboardA);
            mockedPrisma.quizParticipant.findUnique.mockResolvedValue(null);
            mockedPrisma.quizParticipant.count.mockResolvedValue(5);
            mockedPrisma.quizSession.create.mockResolvedValue({ id: 'new-session', participants: [] });

            const token = createToken(userA);
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });

            await sessionsHandler(req, res);
            expect(mockedPrisma.quizSession.create).toHaveBeenCalled();
        });

        test('strictly rejects joining when session is full', async () => {
            const session = { id: 'full-session', participants: [] };
            mockedPrisma.quizSession.findMany.mockResolvedValue([session]);
            mockedPrisma.leaderboard.findUnique.mockResolvedValue(null);
            mockedPrisma.quizParticipant.findUnique.mockResolvedValue(null);
            mockedPrisma.quizParticipant.count.mockResolvedValue(5);

            const token = createToken(userA);
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });

            await sessionsHandler(req, res);
            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData()).message).toBe('Session is full');
        });
    });

    describe('Timer Integrity & Answer Handling', () => {
        test('rejects answers after 5 minute timeout', async () => {
            const expiredStartTime = new Date(Date.now() - 301000);
            const session = { id: 's1', startTime: expiredStartTime, endTime: null };
            mockedPrisma.quizSession.findFirst.mockResolvedValue(session);

            const token = createToken(userA);
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { questionId: 1, answer: 'A' }
            });

            await answerHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData()).message).toContain('expired');
        });

        test('prevents duplicate answers for the same question in a session', async () => {
            const session = { id: 's1', startTime: new Date(), endTime: null };
            mockedPrisma.quizSession.findFirst.mockResolvedValue(session);
            mockedPrisma.quizParticipant.findUnique.mockResolvedValue({ id: 'p1' } as any);
            mockedPrisma.userQuestionData.findUnique.mockResolvedValue({
                lastAttempt: new Date()
            } as any);

            const token = createToken(userA);
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { questionId: 1, answer: 'A' }
            });

            await answerHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData()).message).toContain('already answered');
        });
    });

    describe('SSE & Broadcast Isolation', () => {
        test('broadcast isolation: only users in the same session receive updates', async () => {
            const session1 = { id: 's1', participants: [] };
            const session2 = { id: 's2', participants: [] };

            // User A in Session 1
            const resA = createMocks().res;
            resA.write = jest.fn();
            mockedPrisma.quizSession.findMany.mockResolvedValueOnce([session1]);
            mockedPrisma.leaderboard.findUnique.mockResolvedValue(null);
            await eventsHandler(createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${createToken(userA)}` }
            }).req, resA);

            // User C in Session 2
            const resC = createMocks().res;
            resC.write = jest.fn();
            mockedPrisma.quizSession.findMany.mockResolvedValueOnce([session2]);
            await eventsHandler(createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${createToken(userC)}` }
            }).req, resC);

            // User B joins Session 1
            mockedPrisma.quizSession.findMany.mockResolvedValue([session1]);
            mockedPrisma.quizParticipant.findUnique.mockResolvedValue(null);
            mockedPrisma.quizParticipant.count.mockResolvedValue(1);
            mockedPrisma.quizParticipant.create.mockResolvedValue({ userId: 'user-b', sessionId: 's1' });
            mockedPrisma.quizParticipant.findMany.mockResolvedValue([{ user: userA }, { user: userB }]);

            await sessionsHandler(createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${createToken(userB)}` }
            }).req, createMocks().res);

            // User A should get update, User C should NOT
            expect(resA.write).toHaveBeenCalledWith(expect.stringContaining('participant_update'));
            expect(resC.write).not.toHaveBeenCalledWith(expect.stringContaining('participant_update'));
        });
    });

    describe('Results & Persistence', () => {
        test('results include ranking and XP earned', async () => {
            const session = {
                id: 's1',
                startTime: new Date(),
                endTime: new Date(),
                participants: [
                    { userId: 'user-a', score: 20, user: userA },
                    { userId: 'user-b', score: 10, user: userB }
                ]
            };
            mockedPrisma.quizSession.findFirst.mockResolvedValue(session);
            mockedPrisma.quizSession.findUnique.mockResolvedValue(session);

            const token = createToken(userA);
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });

            await resultsHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());
            expect(data.results[0].userId).toBe('user-a');
            expect(data.results[0].rank).toBe(1);
            expect(data.results[0].xpEarned).toBe(100);
        });

        test('cannot fetch results before session end (logic ends it automatically in resultsHandler)', async () => {
             const session = {
                id: 's1',
                startTime: new Date(),
                endTime: null,
                participants: [{ userId: 'user-a', score: 20, user: userA }]
            };
            mockedPrisma.quizSession.findFirst.mockResolvedValue(session);
            mockedPrisma.quizSession.update.mockResolvedValue({ ...session, endTime: new Date() });
            mockedPrisma.quizSession.findUnique.mockResolvedValue({ ...session, endTime: new Date(), participants: [{ userId: 'user-a', score: 20, user: userA }] });

            const token = createToken(userA);
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });

            await resultsHandler(req, res);
            expect(mockedPrisma.quizSession.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { endTime: expect.any(Date) }
            }));
            expect(res._getStatusCode()).toBe(200);
        });
    });

    describe('Concurrency Simulation', () => {
        test('handles parallel join requests', async () => {
            const session = { id: 's1', participants: [] };
            mockedPrisma.quizSession.findMany.mockResolvedValue([session]);
            mockedPrisma.quizParticipant.findUnique.mockResolvedValue(null);
            mockedPrisma.leaderboard.findUnique.mockResolvedValue(null);

            mockedPrisma.quizParticipant.count.mockResolvedValue(4);
            mockedPrisma.quizParticipant.findMany.mockResolvedValue([]);

            const joinUser = async (user: any) => {
                const { req, res } = createMocks({
                    method: 'GET',
                    headers: { authorization: `Bearer ${createToken(user)}` }
                });
                await sessionsHandler(req, res);
                return res;
            };

            await Promise.all([
                joinUser(userA),
                joinUser(userB)
            ]);

            expect(mockedPrisma.quizParticipant.create).toHaveBeenCalledTimes(2);
        });
    });
});
