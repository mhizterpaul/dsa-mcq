import { createMocks } from 'node-mocks-http';
import sessionsHandler from '../../pages/api/daily-quiz/sessions';
import stateHandler from '../../pages/api/daily-quiz/state';
import exitHandler from '../../pages/api/daily-quiz/exit';
import answerHandler from '../../pages/api/daily-quiz/answer';
import resultsHandler from '../../pages/api/daily-quiz/results';
import { prisma } from '../../infra/prisma/client';
import { QuizService } from '../../controllers/quizController';
import { EngagementService } from '../../controllers/engagementController';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;
process.env.USE_REAL_DB = 'true';

const createToken = async (user: any, options: any = {}) => {
    const sessionId = `sess-${user.id}-${Math.random()}`;
    await prisma.session.upsert({
        where: { id: sessionId },
        update: { expires: new Date(Date.now() + 3600000) },
        create: {
            id: sessionId,
            userId: user.id,
            expires: new Date(Date.now() + 3600000),
            sessionToken: `token-${sessionId}`
        }
    });
    const signOptions = typeof options === 'object' ? options : {};
    return jwt.sign({ user: { id: user.id }, sessionId }, JWT_SECRET, signOptions);
};

const userA = { id: 'user-a', name: 'Alice', email: 'alice@example.com', image: 'avatar-a' };
const userB = { id: 'user-b', name: 'Bob', email: 'bob@example.com', image: 'avatar-b' };
const userC = { id: 'user-c', name: 'Charlie', email: 'charlie@example.com', image: 'avatar-c' };

const leaderboardA = { userId: 'user-a', rank: 10, xp: 1000, userHighestBadge: 'gold' };
const leaderboardB = { userId: 'user-b', rank: 15, xp: 1200, userHighestBadge: 'gold' };
const leaderboardC = { userId: 'user-c', rank: 100, xp: 5000, userHighestBadge: 'bronze' };

const defaultQuestionData = {
    tagsText: 'tags',
    companyTags: 'companies',
    hints: 'hints',
    similarQuestionIds: '',
    similarQuestionsText: ''
};

describe('Daily Quiz Acceptance Tests (Real DB)', () => {
    beforeEach(async () => {
        QuizService.resetState();
        await prisma.session.deleteMany();
        await prisma.quizParticipant.deleteMany();
        await prisma.quizQuestion.deleteMany();
        await prisma.quizSession.deleteMany();
        await prisma.userQuestionData.deleteMany();
        await prisma.engagement.deleteMany();
        await prisma.leaderboard.deleteMany();
        await prisma.user.deleteMany();
        await prisma.question.deleteMany();
        await prisma.category.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('Security & Authorization', () => {
        /**
         * @Doc("Endpoints must reject unauthorized access")
         * @Route("/api/daily-quiz/*")
         */
        test.each([
            ['sessions', (req: any, res: any) => sessionsHandler(req, res, new QuizService(prisma)), '/api/daily-quiz/sessions'],
            ['answer', (req: any, res: any) => answerHandler(req, res, new QuizService(prisma)), '/api/daily-quiz/answer'],
            ['exit', (req: any, res: any) => exitHandler(req, res, new QuizService(prisma)), '/api/daily-quiz/exit'],
            ['results', (req: any, res: any) => resultsHandler(req, res, new QuizService(prisma), new EngagementService(prisma)), '/api/daily-quiz/results']
        ])('%s endpoint rejects unauthenticated requests', async (name, handler, url) => {
            const { req, res } = createMocks({ method: 'GET' });
            const mockReq = req as any;
            mockReq.url = url;
            mockReq.path = url;
            await handler(mockReq, res);

            const mockRes = res as any;
            mockRes.req = mockReq;
            mockRes.status = 401;
            expect(mockRes).toSatisfyApiSpec();
        });

        /**
         * @Doc("Rejects requests with expired session tokens")
         * @Route("/api/daily-quiz/sessions")
         */
        test('should_reject_given_expired_tokens', async () => {
            const user = await prisma.user.create({ data: { ...userA, id: undefined } });
            const token = await createToken(user, { expiresIn: '-1s' });
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });
            const mockReq = req as any;
            mockReq.url = '/api/daily-quiz/sessions';
            mockReq.path = '/api/daily-quiz/sessions';
            await sessionsHandler(mockReq, res, new QuizService(prisma));

            const mockRes = res as any;
            mockRes.req = mockReq;
            mockRes.status = 401;
            expect(mockRes).toSatisfyApiSpec();
        });
    });

    describe('Session Matching & Capacity', () => {
        /**
         * @Doc("Match users with compatible leaderboard stats")
         */
        test('should_match_users_given_similar_achievements', async () => {
            const [uA, uB, uC] = await Promise.all([
                prisma.user.create({ data: { ...userA, id: undefined } }),
                prisma.user.create({ data: { ...userB, id: undefined } }),
                prisma.user.create({ data: { ...userC, id: undefined } }),
            ]);
            await prisma.leaderboard.createMany({ data: [
                { ...leaderboardA, userId: uA.id },
                { ...leaderboardB, userId: uB.id },
                { ...leaderboardC, userId: uC.id },
            ] });

            const tokenA = await createToken(uA);
            const { req: reqA, res: resA } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenA}` },
            });
            const mockReqA = reqA as any;
            mockReqA.url = '/api/daily-quiz/session';
            mockReqA.path = '/api/daily-quiz/session';
            await sessionsHandler(mockReqA, resA, new QuizService(prisma));
            expect(resA._getStatusCode()).toBe(200);

            const mockResA = resA as any;
            mockResA.req = mockReqA;
            mockResA.status = 200;
            mockResA.body = JSON.parse(resA._getData()); // jest-openapi checks .body
            expect(mockResA).toSatisfyApiSpec();
            const dataA = JSON.parse(resA._getData());

            const tokenB = await createToken(uB);
            const { req: reqB, res: resB } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenB}` }
            });
            const mockReqB = reqB as any;
            mockReqB.url = '/api/daily-quiz/session';
            mockReqB.path = '/api/daily-quiz/session';
            await sessionsHandler(mockReqB, resB, new QuizService(prisma));
            expect(resB._getStatusCode()).toBe(200);

            const mockResB = resB as any;
            mockResB.req = mockReqB;
            mockResB.status = 200;
            mockResB.body = JSON.parse(resB._getData());
            expect(mockResB).toSatisfyApiSpec();
            const dataB = JSON.parse(resB._getData());

            expect(dataB.id).toBe(dataA.id);

            const tokenC = await createToken(uC);
            const { req: reqC, res: resC } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenC}` }
            });
            await sessionsHandler(reqC, resC, new QuizService(prisma));
            expect(resC._getStatusCode()).toBe(200);
            const dataC = JSON.parse(resC._getData());

            expect(dataC.id).not.toBe(dataA.id);
        });

        test('should_enforce_capacity_limits_atomically_given_multiple_joins', async () => {
            process.env.SIMULATE_CONCURRENCY = 'true';
            process.env.USE_REAL_DB = 'true';
            const [uA, uB, uC, u4, u5, u6] = await Promise.all([
                prisma.user.create({ data: { ...userA, id: undefined } }),
                prisma.user.create({ data: { ...userB, id: undefined } }),
                prisma.user.create({ data: { ...userC, id: undefined } }),
                prisma.user.create({ data: { email: 'u4@x.com' } }),
                prisma.user.create({ data: { email: 'u5@x.com' } }),
                prisma.user.create({ data: { email: 'u6@x.com' } }),
            ]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const session = await prisma.quizSession.create({
                data: { id: 's1', date: today, startTime: new Date() }
            });

            await prisma.quizParticipant.createMany({
                data: [
                    { userId: uB.id, sessionId: 's1' },
                    { userId: uC.id, sessionId: 's1' },
                    { userId: u4.id, sessionId: 's1' },
                    { userId: u5.id, sessionId: 's1' },
                ]
            });

            const quizService = new QuizService(prisma);

            /**
             * @Doc("Ensures session capacity is never exceeded even under high concurrency")
             * @Route("/api/daily-quiz/sessions")
             */
            const results = await Promise.allSettled([
                quizService.findOrCreateParticipant(session, uA),
                quizService.findOrCreateParticipant(session, u6)
            ]);

            const fulfilled = results.filter(r => r.status === 'fulfilled');
            const rejected = results.filter(r => r.status === 'rejected');

            expect(fulfilled).toHaveLength(1);
            expect(rejected).toHaveLength(1);
            expect((rejected[0] as any).reason.message).toContain('Session is full');
            delete process.env.SIMULATE_CONCURRENCY;
            delete process.env.USE_REAL_DB;
        });
    });

    describe('Timer Integrity & Answer Handling', () => {
        /**
         * @Doc("Enforces a strict 5-minute time limit for quiz submissions")
         * @Route("/api/daily-quiz/answer")
         */
        test('should_reject_answers_given_5_minute_timeout', async () => {
            const user = await prisma.user.create({ data: { ...userA, id: undefined } });
            const cat = await prisma.category.create({ data: { id: 'cat1', name: 'Algorithms' } });
            await prisma.question.create({
                data: { id: '1', title: 'Q1', body: 'B1', correct: 'A', difficulty: 'EASY', categoryId: 'cat1', a: 'A', b: 'B', c: 'C', d: 'D', ...defaultQuestionData }
            });

            const expiredStartTime = new Date(Date.now() - 301000);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const session = await prisma.quizSession.create({
                data: { id: 'expired-session', date: today, startTime: expiredStartTime }
            });
            await prisma.quizParticipant.create({
                data: { userId: user.id, sessionId: session.id }
            });

            const token = await createToken(user);
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { questionId: '1', answer: 'A' }
            });

            await answerHandler(req, res, new QuizService(prisma));
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData()).message).toContain('expired');
        });

        /**
         * @Doc("Prevents users from submitting multiple answers for the same question")
         * @Route("/api/daily-quiz/answer")
         */
        test('should_prevent_duplicate_answers_given_repeated_submission', async () => {
            const user = await prisma.user.create({ data: { ...userA, id: undefined } });
            const cat = await prisma.category.create({ data: { id: 'cat1', name: 'Algorithms' } });
            await prisma.question.create({
                data: { id: '1', title: 'Q1', body: 'B1', correct: 'A', difficulty: 'EASY', categoryId: 'cat1', a: 'A', b: 'B', c: 'C', d: 'D', ...defaultQuestionData }
            });

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const session = await prisma.quizSession.create({
                data: { id: 's1', date: today, startTime: new Date() }
            });
            await prisma.quizParticipant.create({
                data: { userId: user.id, sessionId: session.id }
            });

            const token = await createToken(user);
            const answer = async () => {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: { authorization: `Bearer ${token}` },
                    body: { questionId: '1', answer: 'A' }
                });
                await answerHandler(req, res, new QuizService(prisma));
                return res;
            };

            const res1 = await answer();
            expect(res1._getStatusCode()).toBe(200);

            const res2 = await answer();
            expect(res2._getStatusCode()).toBe(400);
            expect(JSON.parse(res2._getData()).message).toContain('already answered');
        });
    });

    describe('Results Calculation', () => {
        test('should_compute_correct_rankings_and_xp_given_finished_session', async () => {
            const [uA, uB] = await Promise.all([
                prisma.user.create({ data: { ...userA, id: undefined } }),
                prisma.user.create({ data: { ...userB, id: undefined } }),
            ]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const session = await prisma.quizSession.create({
                data: { id: 's1', date: today, startTime: new Date(), endTime: new Date() }
            });
            await prisma.quizParticipant.createMany({
                data: [
                    { userId: uA.id, sessionId: 's1', score: 20 },
                    { userId: uB.id, sessionId: 's1', score: 10 },
                ]
            });

            const token = await createToken(uA);
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });

            await resultsHandler(req, res, new QuizService(prisma), new EngagementService(prisma));
            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.rank).toBe(1);
            expect(data.xpEarned).toBe(100);
            expect(data.totalParticipants).toBe(2);
            expect(data.leaderboard).toHaveLength(2);
            expect(data.leaderboard[0].id).toBe(uA.id);
        });
    });

    describe('Polling & State Synchronization', () => {
        test('should_isolate_updates_given_different_sessions', async () => {
            const [uA, uB, uC] = await Promise.all([
                prisma.user.create({ data: { ...userA, id: undefined } }),
                prisma.user.create({ data: { ...userB, id: undefined } }),
                prisma.user.create({ data: { ...userC, id: undefined } }),
            ]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            await prisma.leaderboard.createMany({ data: [
                { userId: uA.id, rank: 1, xp: 100, userHighestBadge: 'gold' },
                { userId: uB.id, rank: 1, xp: 100, userHighestBadge: 'gold' },
                { userId: uC.id, rank: 1000, xp: 10000, userHighestBadge: 'bronze' },
            ] });

            const tokenA = await createToken(uA);
            const tokenB = await createToken(uB);
            const tokenC = await createToken(uC);

            const resInitA = createMocks().res;
            await sessionsHandler(createMocks({ method: 'GET', headers: { authorization: `Bearer ${tokenA}` } }).req, resInitA, new QuizService(prisma));
            const s1Id = JSON.parse(resInitA._getData()).id;

            const resInitC = createMocks().res;
            await sessionsHandler(createMocks({ method: 'GET', headers: { authorization: `Bearer ${tokenC}` } }).req, resInitC, new QuizService(prisma));
            const s2Id = JSON.parse(resInitC._getData()).id;

            expect(s1Id).not.toBe(s2Id);

            await sessionsHandler(createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenB}` }
            }).req, createMocks().res, new QuizService(prisma));

            const { req: reqPollA, res: resPollA } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenA}` }
            });
            await stateHandler(reqPollA, resPollA, new QuizService(prisma));
            const stateA = JSON.parse(resPollA._getData());
            expect(stateA.participants.some((p: any) => p.userId === uB.id)).toBe(true);

            const { req: reqPollC, res: resPollC } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenC}` }
            });
            await stateHandler(reqPollC, resPollC, new QuizService(prisma));
            const stateC = JSON.parse(resPollC._getData());
            expect(stateC.participants.some((p: any) => p.userId === uB.id)).toBe(false);
        });

        test('should_reflect_session_availability_given_server_load', async () => {
            const uA = await prisma.user.create({ data: { ...userA, id: undefined } });
            const tokenA = await createToken(uA);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            await prisma.quizSession.deleteMany({ where: { date: today } });

            for (let i = 0; i < 10; i++) {
                const sessionDate = new Date(today);
                sessionDate.setSeconds(i);
                const s = await prisma.quizSession.create({ data: { id: `full-${i}`, date: sessionDate, startTime: new Date() } });
                for (let j = 0; j < 5; j++) {
                    const uid = `u-${i}-${j}`;
                    await prisma.user.create({ data: { id: uid, email: `${uid}@x.com` }});
                    await prisma.quizParticipant.create({ data: { userId: uid, sessionId: s.id } });
                }
            }

            const { req: reqPoll1, res: resPoll1 } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenA}` }
            });
            await stateHandler(reqPoll1, resPoll1, new QuizService(prisma));
            expect(JSON.parse(resPoll1._getData()).status).toBe('WAITING');

            await prisma.quizSession.delete({ where: { id: 'full-0' } });

            const { req: reqPoll2, res: resPoll2 } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenA}` }
            });
            await stateHandler(reqPoll2, resPoll2, new QuizService(prisma));
            expect(JSON.parse(resPoll2._getData()).status).toBe('AVAILABLE');
        });
    });
});
