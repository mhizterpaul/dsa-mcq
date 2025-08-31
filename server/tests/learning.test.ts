import fetch from 'node-fetch';
import { startServer, stopServer } from './test-utils';

const API_URL = 'http://localhost:3000/api/learning';

describe('/api/learning', () => {
  beforeAll(async () => {
    await startServer();
  });

  afterAll(() => {
    stopServer();
  });

  describe('/featured-categories', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const response = await fetch(`${API_URL}/featured-categories`, { method: 'POST' });
      expect(response.status).toBe(405);
    });

    it('should return 200 and an array of categories on success', async () => {
      const response = await fetch(`${API_URL}/featured-categories`);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('id');
        expect(body[0]).toHaveProperty('name');
        expect(body[0]).toHaveProperty('masteryScore');
      }
    });
  });

  describe('/questions', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const response = await fetch(`${API_URL}/questions`, { method: 'GET' });
      expect(response.status).toBe(405);
    });

    it('should return 400 Bad Request for malformed body', async () => {
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(400);
    });

    it('should return 200 and questions on success', async () => {
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [1, 2, 3] }),
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('id');
        expect(body[0]).toHaveProperty('question');
        expect(body[0]).toHaveProperty('options');
        expect(Array.isArray(body[0].options)).toBe(true);
      }
    });
  });
});
