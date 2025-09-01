import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import registerHandler from '../src/pages/api/auth/register';
import answerHandler from '../src/pages/api/daily-quiz/answer';
import eventsHandler from '../src/pages/api/daily-quiz/events';
import resultsHandler from '../src/pages/api/daily-quiz/results';
import sessionHandler from '../src/pages/api/daily-quiz/session';
import exitHandler from '../src/pages/api/daily-quiz/exit';
import { PrismaClient } from '@prisma/client';
import EventSource from 'eventsource';
import jwt from 'jsonwebtoken';
import { quizService } from '../src/services/quizService';

const prisma = new PrismaClient();

// This is a placeholder for Google provider, since the original is not available in test scope.
const Google = (options: any) => ({ id: 'google', ...options });

beforeAll(() => {
  process.env.AUTH_PROVIDERS = JSON.stringify([
    Google({
      clientId: "google-id-123",
      clientSecret: "dummy-google-secret",
      authorization: {
        url: "https://oauth-mock.mock.beeceptor.com/oauth/authorize",
      },
      token: {
        url: "https://oauth-mock.mock.beeceptor.com/oauth/token/google",
      },
      userinfo: {
        url: "https://oauth-mock.mock.beeceptor.com/userinfo/google",
      },
    }),
  ]);
});

// Mock the mail service
jest.mock('../src/services/mailService', () => {
  return {
    sendEmail: jest.fn((to: string, subject: string, body: string) => {
      // Extract code from body and store it for test use
      const codeMatch = body.match(/code: (\w+)/);
      if (codeMatch) {
        (global as any).lastResetCode = codeMatch[1];
      }
      const tokenMatch = body.match(/token: (\w+)/);
      if (tokenMatch) {
        (global as any).lastVerificationToken = tokenMatch[1];
      }
      return Promise.resolve();
    }),
  };
});

// A single, consistent mock request/response creator
function makeReqRes(method: 'POST' | 'GET', options: { query?: any, body?: any, url?: string, headers?: any } = {}) {
  const { query = {}, body = {}, url = '', headers = {} } = options;
  const { req, res } = createMocks({ method, query, body, url, headers });
  // This is needed to make the mock req/res compatible with NextApiRequest/NextApiResponse
  req.headers = headers;
  return { req: req as NextApiRequest, res: res as NextApiResponse };
}

// Helper function to create an authenticated user
async function createAuthenticatedUser(email = 'testuser@example.com', password = 'TestPassword123!') {
  // Step 1: Register user
  let { req, res } = makeReqRes('POST', { body: { email, password } });
  await registerHandler(req, res);

  // Step 2: Verify email
  const verificationToken = (global as any).lastVerificationToken;
  ({ req, res } = makeReqRes('POST', {
    query: { verify: 'email' },
    body: { verificationToken },
  }));
  await registerHandler(req, res);

  const { user } = JSON.parse(res._getData());
  // Sign a new token with the user data
  const accessToken = jwt.sign({ user }, 'your-jwt-secret');
  return { user, accessToken };
}


describe('/api/daily-quiz', () => {
  beforeEach(async () => {
    // Clean the database before each test
    await prisma.verificationToken.deleteMany({});
    await prisma.user.deleteMany({});
    // Reset quiz sessions
    quizService.reset();
  });

  afterAll(async () => {
    // Disconnect the Prisma client after all tests
    await prisma.$disconnect();
  });

  describe('/session', () => {
    it('GET /session returns the daily quiz session and adds the user as a participant', async () => {
      const { user, accessToken } = await createAuthenticatedUser();

      const { req, res } = makeReqRes('GET', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      await sessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const sessionData = JSON.parse(res._getData());
      expect(sessionData.id).toBeDefined();
      expect(sessionData.participants).toBeDefined();
      const participant = sessionData.participants.find((p: any) => p.id === user.id);
      expect(participant).toBeDefined();
      expect(participant.email).toBe(user.email);
    });
  });

  describe('/answer', () => {
    it('submits a correct user answer and returns the updated score', async () => {
      const { user, accessToken } = await createAuthenticatedUser();

      // Join the quiz
      const session = quizService.getOrCreateDailyQuizSession();
      quizService.addParticipant(session.id, user);
      // Add a mock question
      session.questions = [{ id: '1', text: 'What is 2+2?', correctAnswer: '4' }];

      // Submit correct answer
      const { req, res } = makeReqRes('POST', {
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { questionId: '1', answer: '4' },
      });
      await answerHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const answerResult = JSON.parse(res._getData());
      expect(answerResult).toMatchObject({
        correct: true,
        score: 10,
        streak: 1,
      });
    });
  });

  describe('/events', () => {
    it('sends a participant-joined event when a new user joins', (done) => {
      createAuthenticatedUser('user1@example.com').then(({ accessToken }) => {
        const eventSource = new EventSource('http://localhost/api/daily-quiz/events', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'participant-joined') {
            expect(data.participant.email).toBe('user2@example.com');
            eventSource.close();
            done();
          }
        };

        // In a separate async flow, create a second user and have them join
        createAuthenticatedUser('user2@example.com').then(({ accessToken: accessToken2 }) => {
          const { req, res } = makeReqRes('GET', {
            headers: { Authorization: `Bearer ${accessToken2}` },
          });
          sessionHandler(req, res);
        });
      });
    });
  });

  describe('/results', () => {
    it('GET /results returns the results for the current session', async () => {
      const { user, accessToken } = await createAuthenticatedUser();

      // Join the quiz and answer a question
      const session = quizService.getOrCreateDailyQuizSession();
      quizService.addParticipant(session.id, user);
      session.questions = [{ id: '1', text: 'What is 2+2?', correctAnswer: '4' }];
      quizService.handleAnswer(session.id, user.id, '1', '4');

      // Get results
      const { req, res } = makeReqRes('GET', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      await resultsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const resultsData = JSON.parse(res._getData());
      expect(resultsData.sessionId).toBe(session.id);
      expect(resultsData.results).toBeDefined();
      const userResult = resultsData.results.find((r: any) => r.id === user.id);
      expect(userResult).toBeDefined();
      expect(userResult.score).toBe(10);
    });
  });

  describe('/exit', () => {
    it('POST /exit removes the user from the quiz session', async () => {
      const { user, accessToken } = await createAuthenticatedUser();

      // Join the quiz
      const session = quizService.getOrCreateDailyQuizSession();
      quizService.addParticipant(session.id, user);

      // Exit the quiz
      const { req, res } = makeReqRes('POST', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      await exitHandler(req, res);

      expect(res._getStatusCode()).toBe(200);

      // Check that the user is no longer in the session
      const updatedSession = quizService.getOrCreateDailyQuizSession();
      const participant = updatedSession.participants.get(user.id);
      expect(participant).toBeUndefined();
    });
  });
});
