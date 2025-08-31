import request from 'supertest';
import answerHandler from '../src/pages/api/daily-quiz/answer';
import eventsHandler from '../src/pages/api/daily-quiz/events';
import resultsHandler from '../src/pages/api/daily-quiz/results';
import sessionHandler from '../src/pages/api/daily-quiz/session';

describe('/api/daily-quiz', () => {
  describe('/answer', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const { status } = await request(answerHandler).get('/');
      expect(status).toBe(405);
    });

    it('should return 200 OK on successful answer submission', async () => {
      const { status } = await request(answerHandler)
        .post('/')
        .send({ questionId: '1', answerId: '1' });
      expect(status).toBe(200);
    });
  });

  describe('/events', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const { status } = await request(eventsHandler).post('/');
      expect(status).toBe(405);
    });

    it('should return 200 OK and SSE headers on success', async () => {
      const response = await request(eventsHandler).get('/');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/event-stream');
    });
  });

  describe('/results', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const { status } = await request(resultsHandler).post('/');
      expect(status).toBe(405);
    });

    it('should return 200 OK on success', async () => {
      const { status } = await request(resultsHandler).get('/?sessionId=123');
      expect(status).toBe(200);
    });
  });

  describe('/session', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const { status } = await request(sessionHandler).post('/');
      expect(status).toBe(405);
    });

    it('should return 200 OK on success', async () => {
      const { status } = await request(sessionHandler).get('/');
      expect(status).toBe(200);
    });
  });
});
