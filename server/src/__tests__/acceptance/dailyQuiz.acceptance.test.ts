import { createMocks } from 'node-mocks-http';
import sessionsHandler from '../../pages/api/daily-quiz/sessions';
import eventsHandler from '../../pages/api/daily-quiz/events';
import exitHandler from '../../pages/api/daily-quiz/exit';
import answerHandler from '../../pages/api/daily-quiz/answer';
import resultsHandler from '../../pages/api/daily-quiz/results';
import { prisma } from '../../infra/prisma/client';
import { QuizService } from '../../controllers/quizController';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;
process.env.USE_REAL_DB = 'true';

const createToken = async (user: any, options = {}) => {
    const sessionId = `sess-${user.id}`;
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
    return jwt.sign({ user, sessionId }, JWT_SECRET, options);
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
        // Cleanup database in correct order
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
            await prisma.user.create({ data: userA });
            const expiredToken = jwt.sign({ user: userA, sessionId: 'some-sess' }, JWT_SECRET, { expiresIn: '-1s' });
            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${expiredToken}` }
            });
            await sessionsHandler(req, res);
            expect(res._getStatusCode()).toBe(401);
        });
    });

    describe('Session Matching & Capacity', () => {
        test('users with similar achievements are matched into the same session', async () => {
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

        test('findOrCreateParticipant enforces capacity limits atomically', async () => {
            process.env.SIMULATE_CONCURRENCY = 'true';
            await prisma.user.createMany({ data: [userA, userB, userC, { id: 'u4' }, { id: 'u5' }, { id: 'u6' }] });
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
        });
    });

    describe('Timer Integrity & Answer Handling', () => {
        test('rejects answers after 5 minute timeout', async () => {
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

            const { req, res } = createMocks({
                method: 'POST',
                headers: { authorization: `Bearer ${await createToken(userA)}` },
                body: { questionId: 1, answer: 'A' }
            });

            await answerHandler(req, res);
            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData()).message).toContain('expired');
        });

        test('prevents duplicate answers', async () => {
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

            const answer = async () => {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: { authorization: `Bearer ${await createToken(userA)}` },
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
        test('computes correct rankings and XP', async () => {
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

            const { req, res } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${await createToken(userA)}` }
            });

            await resultsHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.results[0].userId).toBe('user-a');
            expect(data.results[0].rank).toBe(1);
            expect(data.results[0].xpEarned).toBe(100);

            expect(data.results[1].userId).toBe('user-b');
            expect(data.results[1].rank).toBe(2);
            expect(data.results[1].xpEarned).toBe(50);
        });
    });

    describe('SSE & Broadcast Isolation', () => {
        test('broadcast isolation: only users in the same session receive updates', async () => {
            await prisma.user.createMany({ data: [userA, userB, userC] });
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Give them distinct leaderboards
            await prisma.leaderboard.createMany({ data: [
                { userId: userA.id, rank: 1, xp: 100, userHighestBadge: 'gold' },
                { userId: userB.id, rank: 1, xp: 100, userHighestBadge: 'gold' },
                { userId: userC.id, rank: 1000, xp: 10000, userHighestBadge: 'bronze' },
            ] });

            // User A joins and creates participant (creates s1)
            const resInitA = createMocks().res;
            await sessionsHandler(createMocks({ method: 'GET', headers: { authorization: `Bearer ${await createToken(userA)}` } }).req, resInitA);
            const s1Id = JSON.parse(resInitA._getData()).id;

            // User A opens SSE
            const resA = createMocks().res;
            resA.write = jest.fn();
            await eventsHandler(createMocks({ method: 'GET', headers: { authorization: `Bearer ${await createToken(userA)}` } }).req, resA);

            // User C joins and creates participant (creates s2)
            const resInitC = createMocks().res;
            await sessionsHandler(createMocks({ method: 'GET', headers: { authorization: `Bearer ${await createToken(userC)}` } }).req, resInitC);
            const s2Id = JSON.parse(resInitC._getData()).id;

            // User C opens SSE
            const resC = createMocks().res;
            resC.write = jest.fn();
            await eventsHandler(createMocks({ method: 'GET', headers: { authorization: `Bearer ${await createToken(userC)}` } }).req, resC);

            expect(s1Id).not.toBe(s2Id);

            // User B joins Session 1
            await sessionsHandler(createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${await createToken(userB)}` }
            }).req, createMocks().res);

            // User A should get update, User C should NOT
            const aCalls = resA.write.mock.calls.map(c => c[0]);
            const cCalls = resC.write.mock.calls.map(c => c[0]);

            expect(aCalls.some(c => c.includes('participant_update'))).toBe(true);
            expect(cCalls.some(c => c.includes('participant_update'))).toBe(false);
        });

        test('user is notified when session available after failure', async () => {
            await prisma.user.createMany({ data: [userA, userB] });

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (let i = 0; i < 10; i++) {
                const s = await prisma.quizSession.create({ data: { id: `full-${i}`, date: today, startTime: new Date() } });
                for (let j = 0; j < 5; j++) {
                    const uid = `u-${i}-${j}`;
                    await prisma.user.create({ data: { id: uid, email: `${uid}@x.com` }});
                    await prisma.quizParticipant.create({ data: { userId: uid, sessionId: s.id } });
                }
            }

            const resEv = createMocks().res;
            resEv.write = jest.fn();
            const reqEv = createMocks({ method: 'GET', headers: { authorization: `Bearer ${await createToken(userA)}` } }).req;
            await eventsHandler(reqEv, resEv);

            expect(resEv.write).toHaveBeenCalledWith(expect.stringContaining('"type":"waiting"'));

            // Free up a slot by deleting a session
            await prisma.quizSession.delete({ where: { id: 'full-0' } });

            const { req: reqS, res: resS } = createMocks({
                method: 'GET',
                headers: { authorization: `Bearer ${await createToken(userB)}` }
            });
            await sessionsHandler(reqS, resS);

            expect(resEv.write).toHaveBeenCalledWith(expect.stringContaining('"type":"session_available"'));
        });
    });
});
