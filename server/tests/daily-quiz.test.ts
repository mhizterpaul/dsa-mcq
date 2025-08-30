import { createMocks } from 'node-mocks-http';
import answerHandler from '../src/pages/api/daily-quiz/answer';
import eventsHandler from '../src/pages/api/daily-quiz/events';
import resultsHandler from '../src/pages/api/daily-quiz/results';
import sessionHandler from '../src/pages/api/daily-quiz/session';
import registerHandler from '../src/pages/api/auth/register';

describe('/api/daily-quiz', () => {
  describe('/answer', () => {
  it('submits a user answer after joining the daily quiz', async () => {
    // Step 1: Register a new user
    let { req, res } = createMocks({
      method: 'POST',
      body: { email: 'quizuser@example.com', password: 'QuizPass123!' },
    });
    await registerHandler(req, res);
    expect(res._getStatusCode()).toBe(201);

    const { accessToken } = JSON.parse(res._getData());

    // Step 2: Get daily quiz (user joins group)
    ({ req, res } = createMocks({
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }));
    await dailyQuizHandler(req, res);
    expect(res._getStatusCode()).toBe(200);

    const quizData = JSON.parse(res._getData());
    expect(quizData).toHaveProperty('quizId');
    expect(quizData.questions.length).toBeGreaterThan(0);

    const questionId = quizData.questions[0].questionId;

    // Step 3: Submit answer
    ({ req, res } = createMocks({
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { questionId, answer: 'a' },
    }));
    await answerHandler(req, res);
    expect(res._getStatusCode()).toBe(200);

    const answerResult = JSON.parse(res._getData());
    expect(answerResult).toMatchObject({
      questionId,
      answer: 'a',
      score: expect.any(Number),
      streak: expect.any(Number),
    });
  });
});

  describe('/events', () => {
    it('connects to quiz events successfully', async () => {
      const { req, res } = createMocks({ method: 'GET' });
      await eventsHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      // TODO: Add assertions for SSE headers or streamed data
    });
  });

  describe('/results', () => {
    it('retrieves quiz results successfully', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { sessionId: '123' },
      });
      await resultsHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      // TODO: Add assertions for results data
    });
  });

  describe('/session', () => {
    it('retrieves session data successfully', async () => {
      const { req, res } = createMocks({ method: 'GET' });
      await sessionHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      // TODO: Add assertions for session payload
    });
  });
});
