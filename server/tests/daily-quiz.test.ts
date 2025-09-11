import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismockClient } from 'prismock';
import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Import the actual handlers
import answerHandler from '../src/pages/api/daily-quiz/answer';
import eventsHandler from '../src/pages/api/daily-quiz/events';
import exitHandler from '../src/pages/api/daily-quiz/exit';
import resultsHandler from '../src/pages/api/daily-quiz/results';
import sessionsHandler from '../src/pages/api/daily-quiz/sessions';

// Import services and the singleton module
import { QuizService, MockSessionStore } from '../src/services/quizService';
import { CacheService } from '../src/services/cacheService';
import * as quizServiceInstance from '../src/services/quizServiceInstance';

// Mock the singleton module
jest.mock('../src/services/quizServiceInstance');

describe('/api/daily-quiz', () => {
    let prismock: PrismockClient;
    let cacheService: CacheService;
    let testUser: User;
    let testUserToken: string;
    let testUser2: User;
    let testUser2Token: string;
    let expiredToken: string;
    let quizService: QuizService; // The single instance for the test suite

    beforeAll(async () => {
        prismock = new PrismockClient() as unknown as PrismockClient;
        cacheService = new CacheService();

        testUser = await prismock.user.create({
            data: {
                id: 'test-user-id-1',
                name: 'Test User 1',
                email: 'test1@example.com',
                password: 'password',
            },
        });
        testUserToken = jwt.sign({ user: testUser }, 'your-jwt-secret');

        testUser2 = await prismock.user.create({
            data: {
                id: 'test-user-id-2',
                name: 'Test User 2',
                email: 'test2@example.com',
                password: 'password',
            },
        });
        testUser2Token = jwt.sign({ user: testUser2 }, 'your-jwt-secret');

        const expiredUser = { id: 'expired-user', name: 'Expired User' };
        expiredToken = jwt.sign({ user: expiredUser }, 'your-jwt-secret', { expiresIn: '-1s' });
    });

    beforeEach(async () => {
        // Clean up database before each test
        await prismock.quizParticipant.deleteMany({});
        await prismock.quizSession.deleteMany({});

        // Create a new QuizService for each test to ensure isolation
        quizService = new QuizService(prismock, cacheService);

        // Configure the mock to return our test-specific QuizService instance
        Object.defineProperty(quizServiceInstance, 'quizService', {
            get: () => quizService,
        });
    });

    const makeReqRes = (method: 'POST' | 'GET', options: { headers?: any, body?: any } = {}) => {
        const { req, res } = createMocks({
            method,
            headers: { Authorization: `Bearer ${testUserToken}`, ...options.headers },
            body: options.body,
        });
        return { req: req as NextApiRequest, res: res as NextApiResponse };
    };

    describe('/sessions', () => {
        it('should create a new session and add the authenticated user', async () => {
            const { req, res } = makeReqRes('GET');
            await sessionsHandler(req, res);

            // Check API response
            expect(res._getStatusCode()).toBe(200);
            const body = JSON.parse(res._getData());
            expect(body.id).toBeDefined();
            expect(body.participants).toHaveLength(1);
            expect(body.participants[0].userId).toBe(testUser.id);

            // Check DB state
            const dbSessions = await prismock.quizSession.findMany({});
            expect(dbSessions).toHaveLength(1);
            const dbParticipants = await prismock.quizParticipant.findMany({});
            expect(dbParticipants).toHaveLength(1);
            expect(dbParticipants[0].userId).toBe(testUser.id);
            expect(dbParticipants[0].sessionId).toBe(dbSessions[0].id);
        });
    });

    describe('/answer', () => {
        it('should accept a correct answer and update the score in the database', async () => {
            // Setup: create a question
            await prismock.question.create({ data: { id: 'q1', title: 'Test Q', body: 'b', difficulty: 'EASY', correctAnswer: 'A' } });

            const { req, res } = makeReqRes('POST', { body: { questionId: 'q1', answer: 'A' } });

            await answerHandler(req, res);

            // Check API response
            expect(res._getStatusCode()).toBe(200);
            const body = JSON.parse(res._getData());
            expect(body.isCorrect).toBe(true);
            expect(body.score).toBe(10);
            expect(body.streak).toBe(1);

            // Check DB state
            const participant = await prismock.quizParticipant.findFirst({ where: { userId: testUser.id } });
            expect(participant).not.toBeNull();
            expect(participant?.score).toBe(10);
            expect(participant?.streak).toBe(1);
        });
    });

    describe('/results', () => {
        it('should return the current results for the session from the database', async () => {
            // Setup: A user joins and answers a question
            await prismock.question.create({ data: { id: 'q1', title: 'Test Q', body: 'b', difficulty: 'EASY', correctAnswer: 'A' } });
            await quizService.handleAnswer(testUser.id, 'q1', 'A');

            // Action: Call the results handler
            const { req, res } = makeReqRes('GET');
            await resultsHandler(req, res);

            // Check API response
            expect(res._getStatusCode()).toBe(200);
            const body = JSON.parse(res._getData());
            expect(body.results).toHaveLength(1);
            expect(body.results[0].userId).toBe(testUser.id);
            expect(body.results[0].score).toBe(10);
        });
    });

    describe('/exit', () => {
        it('should remove a participant from the database', async () => {
            // Setup: a user joins the session
            const session = await quizService.getOrCreateDailyQuizSession();
            await quizService.findOrCreateParticipant(session, testUser);

            // Pre-condition check
            let participant = await prismock.quizParticipant.findFirst({ where: { userId: testUser.id } });
            expect(participant).not.toBeNull();

            // Action: call the exit handler
            const { req, res } = makeReqRes('POST');
            await exitHandler(req, res);

            // Check API response
            expect(res._getStatusCode()).toBe(200);

            // Check DB state
            participant = await prismock.quizParticipant.findFirst({ where: { userId: testUser.id } });
            expect(participant).toBeNull();
        });
    });

    describe('/events', () => {
        it('should trigger a broadcast when a new user joins', async () => {
            const { req, res } = makeReqRes('GET');
            const broadcastSpy = jest.spyOn(quizService, 'broadcast');

            // Mock the response for the SSE connection
            (res as any).flushHeaders = jest.fn();
            res.write = jest.fn();

            // 1. User 1 connects to the event stream.
            const session = await quizService.getOrCreateDailyQuizSession();
            quizService.addSseConnection(session.id, testUser.id, res);

            // 2. User 2 joins the session, which should trigger a broadcast
            const { req: req2, res: res2 } = makeReqRes('GET', { headers: { Authorization: `Bearer ${testUser2Token}` } });
            await sessionsHandler(req2, res2);

            // 3. Assert that broadcast was called with the correct event
            expect(broadcastSpy).toHaveBeenCalledWith(
                session.id,
                expect.objectContaining({
                    type: 'participant-joined',
                    participant: expect.objectContaining({ userId: testUser2.id }),
                })
            );

            broadcastSpy.mockRestore();
        });
    });

    describe('Multi-User Workflow', () => {
        it('should correctly handle multiple users joining, answering, and getting results', async () => {
            // Setup: create a question
            await prismock.question.create({ data: { id: 'q-workflow', title: 'Workflow Q', body: 'b', difficulty: 'EASY', correctAnswer: 'A' } });

            // 1. User 1 joins
            const { req: req1, res: res1 } = makeReqRes('GET', { headers: { Authorization: `Bearer ${testUserToken}` } });
            await sessionsHandler(req1, res1);
            expect(res1._getStatusCode()).toBe(200);
            let participants = await prismock.quizParticipant.findMany({});
            expect(participants).toHaveLength(1);
            expect(participants[0].userId).toBe(testUser.id);

            // 2. User 2 joins
            const { req: req2, res: res2 } = makeReqRes('GET', { headers: { Authorization: `Bearer ${testUser2Token}` } });
            await sessionsHandler(req2, res2);
            expect(res2._getStatusCode()).toBe(200);
            participants = await prismock.quizParticipant.findMany({});
            expect(participants).toHaveLength(2);

            // 3. User 1 answers correctly
            const { req: req3, res: res3 } = makeReqRes('POST', {
                headers: { Authorization: `Bearer ${testUserToken}` },
                body: { questionId: 'q-workflow', answer: 'A' },
            });
            await answerHandler(req3, res3);
            expect(res3._getStatusCode()).toBe(200);
            const participant1 = await prismock.quizParticipant.findFirst({ where: { userId: testUser.id } });
            expect(participant1?.score).toBe(10);

            // 4. User 2 answers incorrectly
            const { req: req4, res: res4 } = makeReqRes('POST', {
                headers: { Authorization: `Bearer ${testUser2Token}` },
                body: { questionId: 'q-workflow', answer: 'B' },
            });
            await answerHandler(req4, res4);
            expect(res4._getStatusCode()).toBe(200);
            const participant2 = await prismock.quizParticipant.findFirst({ where: { userId: testUser2.id } });
            expect(participant2?.score).toBe(0);

            // 5. Get results
            const { req: req5, res: res5 } = makeReqRes('GET', { headers: { Authorization: `Bearer ${testUserToken}` } });
            await resultsHandler(req5, res5);
            expect(res5._getStatusCode()).toBe(200);
            const body = JSON.parse(res5._getData());

            // Assert final API response
            expect(body.results).toHaveLength(2);
            const user1Result = body.results.find((r: any) => r.userId === testUser.id);
            const user2Result = body.results.find((r: any) => r.userId === testUser2.id);
            expect(user1Result.score).toBe(10);
            expect(user2Result.score).toBe(0);
        });
    });

    describe('Authentication', () => {
        const endpoints = [
            { name: '/sessions', handler: require('../src/pages/api/daily-quiz/sessions').default },
            { name: '/answer', handler: require('../src/pages/api/daily-quiz/answer').default },
            { name: '/results', handler: require('../src/pages/api/daily-quiz/results').default },
            { name: '/exit', handler: require('../src/pages/api/daily-quiz/exit').default },
            { name: '/events', handler: require('../src/pages/api/daily-quiz/events').default },
        ];

        for (const endpoint of endpoints) {
            it(`should return 401 for unauthenticated access to ${endpoint.name}`, async () => {
                const { req, res } = createMocks({ method: endpoint.method as any });
                await endpoint.handler(req, res);
                expect(res._getStatusCode()).toBe(401);
            });
        }

        it('should return 401 for an expired token', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                headers: { Authorization: `Bearer ${expiredToken}` },
            });
            await require('../src/pages/api/daily-quiz/sessions').default(req, res);
            expect(res._getStatusCode()).toBe(401);
        });
    });
});
