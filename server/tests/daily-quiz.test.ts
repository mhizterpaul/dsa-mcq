import fetch from 'node-fetch';
import { startServer, stopServer } from './test-utils';

const API_URL = 'http://localhost:3000/api/daily-quiz';

describe('/api/daily-quiz', () => {
  beforeAll(async () => {
    await startServer();
  });

  afterAll(() => {
    stopServer();
  });

  describe('/answer', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const response = await fetch(`${API_URL}/answer`, { method: 'GET' });
      expect(response.status).toBe(405);
    });

    it('should return 200 OK on successful answer submission', async () => {
      const response = await fetch(`${API_URL}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: '1', answerId: '1' }),
      });
      expect(response.status).toBe(200);
    });
  });

  describe('/events', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const response = await fetch(`${API_URL}/events`, { method: 'POST' });
      expect(response.status).toBe(405);
    });

    it('should return 200 OK and SSE headers on success', async () => {
      const response = await fetch(`${API_URL}/events`);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });
  });

  describe('/results', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const response = await fetch(`${API_URL}/results`, { method: 'POST' });
      expect(response.status).toBe(405);
    });

    it('should return 200 OK on success', async () => {
      const response = await fetch(`${API_URL}/results?sessionId=123`);
      expect(response.status).toBe(200);
    });
  });

  describe('/session', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const response = await fetch(`${API_URL}/session`, { method: 'POST' });
      expect(response.status).toBe(405);
    });

    it('should return 200 OK on success', async () => {
      const response = await fetch(`${API_URL}/session`);
      expect(response.status).toBe(200);
    });
  });
});
