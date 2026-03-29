import { createMocks } from 'node-mocks-http';
import sessionsHandler from '../../pages/api/daily-quiz/sessions';
import stateHandler from '../../pages/api/daily-quiz/state';
import exitHandler from '../../pages/api/daily-quiz/exit';
import answerHandler from '../../pages/api/daily-quiz/answer';
import resultsHandler from '../../pages/api/daily-quiz/results';
import { prisma } from '../../infra/prisma/client';
import { QuizService } from '../../controllers/quizController';
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
    const signOptions = typeof options === 'string' ? {} : options;
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
        test.each([
            ['sessions', sessionsHandler],
            ['answer', answerHandler],
            ['exit', exitHandler],
            ['results', resultsHandler]
        ])('%s endpoint rejects unauthenticated requests', async (_, handler) => {
            const { req, res } = createMocks({ method: 'GET' });
            await handler(req, res);
            expect(res._getStatusCode()).toBe(401);
        });

        test('should_reject_given_expired_tokens', async () => {
            await prisma.user.create({ data: userA });
            const token = await createToken(userA, { expiresIn: '-1s' });
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });
            await sessionsHandler(req, res);
            expect(res._getStatusCode()).toBe(401);
        });
    });

    describe('Session Matching & Capacity', () => {
        test('should_match_users_given_similar_achievements', async () => {
            await prisma.user.createMany({ data: [userA, userB, userC] });
            await prisma.leaderboard.createMany({ data: [leaderboardA, leaderboardB, leaderboardC] });

            const tokenA = await createToken(userA);
            const { req: reqA, res: resA } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenA}` }
            });
            await sessionsHandler(reqA, resA);
            expect(resA._getStatusCode()).toBe(200);
            const dataA = JSON.parse(resA._getData());

            const tokenB = await createToken(userB);
            const { req: reqB, res: resB } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenB}` }
            });
            await sessionsHandler(reqB, resB);
            expect(resB._getStatusCode()).toBe(200);
            const dataB = JSON.parse(resB._getData());

            expect(dataB.id).toBe(dataA.id);

            const tokenC = await createToken(userC);
            const { req: reqC, res: resC } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenC}` }
            });
            await sessionsHandler(reqC, resC);
            expect(resC._getStatusCode()).toBe(200);
            const dataC = JSON.parse(resC._getData());

            expect(dataC.id).not.toBe(dataA.id);
        });

        test('should_enforce_capacity_limits_atomically_given_multiple_joins', async () => {
            process.env.SIMULATE_CONCURRENCY = 'true';
            process.env.USE_REAL_DB = 'true';
            await prisma.user.createMany({ data: [userA, userB, userC, { id: 'u4', email: 'u4@x.com' }, { id: 'u5', email: 'u5@x.com' }, { id: 'u6', email: 'u6@x.com' }] });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const session = await prisma.quizSession.create({
                data: { id: 's1', date: today, startTime: new Date() }
            });

            await prisma.quizParticipant.createMany({
                data: [
                    { userId: 'user-b', sessionId: 's1' },
                    { userId: 'user-c', sessionId: 's1' },
                    { userId: 'u4', sessionId: 's1' },
                    { userId: 'u5', sessionId: 's1' },
                ]
            });

            const quizService = new QuizService(prisma);

            const results = await Promise.allSettled([
                quizService.findOrCreateParticipant(session, userA),
                quizService.findOrCreateParticipant(session, { id: 'u6' })
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
        test('should_reject_answers_given_5_minute_timeout', async () => {
            await prisma.user.create({ data: userA });
            const cat = await prisma.category.create({ data: { id: 'cat1', name: 'Algorithms' } });
            await prisma.question.create({
                data: { id: 1, title: 'Q1', body: 'B1', correct: 'A', difficulty: 'EASY', categoryId: 'cat1', a: 'A', b: 'B', c: 'C', d: 'D', ...defaultQuestionData }
            });

            const expiredStartTime = new Date(Date.now() - 301000);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const session = await prisma.quizSession.create({
                data: { id: 'expired-session', date: today, startTime: expiredStartTime }
            });
            await prisma.quizParticipant.create({
                data: { userId: userA.id, sessionId: session.id }
            });

            const token = await createToken(userA);
            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${token}` },
                body: { questionId: 1, answer: 'A' }
            });

            await answerHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData()).message).toContain('expired');
        });

        test('should_prevent_duplicate_answers_given_repeated_submission', async () => {
            await prisma.user.create({ data: userA });
            const cat = await prisma.category.create({ data: { id: 'cat1', name: 'Algorithms' } });
            await prisma.question.create({
                data: { id: 1, title: 'Q1', body: 'B1', correct: 'A', difficulty: 'EASY', categoryId: 'cat1', a: 'A', b: 'B', c: 'C', d: 'D', ...defaultQuestionData }
            });

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const session = await prisma.quizSession.create({
                data: { id: 's1', date: today, startTime: new Date() }
            });
            await prisma.quizParticipant.create({
                data: { userId: userA.id, sessionId: session.id }
            });

            const token = await createToken(userA);
            const answer = async () => {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: { authorization: `Bearer ${token}` },
                    body: { questionId: 1, answer: 'A' }
                });
                await answerHandler(req, res);
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
            await prisma.user.createMany({ data: [userA, userB] });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const session = await prisma.quizSession.create({
                data: { id: 's1', date: today, startTime: new Date(), endTime: new Date() }
            });
            await prisma.quizParticipant.createMany({
                data: [
                    { userId: userA.id, sessionId: 's1', score: 20 },
                    { userId: userB.id, sessionId: 's1', score: 10 },
                ]
            });

            const token = await createToken(userA);
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${token}` }
            });

            await resultsHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.rank).toBe(1);
            expect(data.xpEarned).toBe(100);
            expect(data.totalParticipants).toBe(2);
            expect(data.leaderboard).toHaveLength(2);
            expect(data.leaderboard[0].id).toBe('user-a');
        });
    });

    describe('Polling & State Synchronization', () => {
        test('should_isolate_updates_given_different_sessions', async () => {
            await prisma.user.createMany({ data: [userA, userB, userC] });
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            await prisma.leaderboard.createMany({ data: [
                { userId: userA.id, rank: 1, xp: 100, userHighestBadge: 'gold' },
                { userId: userB.id, rank: 1, xp: 100, userHighestBadge: 'gold' },
                { userId: userC.id, rank: 1000, xp: 10000, userHighestBadge: 'bronze' },
            ] });

            const tokenA = await createToken(userA);
            const tokenB = await createToken(userB);
            const tokenC = await createToken(userC);

            const resInitA = createMocks().res;
            await sessionsHandler(createMocks({ method: 'GET', headers: { authorization: `Bearer ${tokenA}` } }).req, resInitA);
            const s1Id = JSON.parse(resInitA._getData()).id;

            const resInitC = createMocks().res;
            await sessionsHandler(createMocks({ method: 'GET', headers: { authorization: `Bearer ${tokenC}` } }).req, resInitC);
            const s2Id = JSON.parse(resInitC._getData()).id;

            expect(s1Id).not.toBe(s2Id);

            await sessionsHandler(createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenB}` }
            }).req, createMocks().res);

            const { req: reqPollA, res: resPollA } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenA}` }
            });
            await stateHandler(reqPollA, resPollA);
            const stateA = JSON.parse(resPollA._getData());
            expect(stateA.participants.some((p: any) => p.userId === 'user-b')).toBe(true);

            const { req: reqPollC, res: resPollC } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenC}` }
            });
            await stateHandler(reqPollC, resPollC);
            const stateC = JSON.parse(resPollC._getData());
            expect(stateC.participants.some((p: any) => p.userId === 'user-b')).toBe(false);
        });

        test('should_reflect_session_availability_given_server_load', async () => {
            await prisma.user.create({ data: userA });
            const tokenA = await createToken(userA);

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
            await stateHandler(reqPoll1, resPoll1);
            expect(JSON.parse(resPoll1._getData()).status).toBe('WAITING');

            await prisma.quizSession.delete({ where: { id: 'full-0' } });

            const { req: reqPoll2, res: resPoll2 } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${tokenA}` }
            });
            await stateHandler(reqPoll2, resPoll2);
            expect(JSON.parse(resPoll2._getData()).status).toBe('AVAILABLE');
        });
    });
});
