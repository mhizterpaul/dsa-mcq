import fetch from 'node-fetch';
import { startServer, stopServer } from './test-utils';

const API_URL = 'http://localhost:3000/api/engagement';

describe('/api/engagement', () => {
  beforeAll(async () => {
    await startServer();
  });

  afterAll(() => {
    stopServer();
  });

  describe('/achievements', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const response = await fetch(`${API_URL}/achievements`, { method: 'POST' });
      expect(response.status).toBe(405);
    });

    it('should return 200 OK on success', async () => {
      const response = await fetch(`${API_URL}/achievements`);
      expect(response.status).toBe(200);
    });
  });

  describe('/leaderboard', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const response = await fetch(`${API_URL}/leaderboard`, { method: 'POST' });
      expect(response.status).toBe(405);
    });

    it('should return 200 OK on success', async () => {
      const response = await fetch(`${API_URL}/leaderboard`);
      expect(response.status).toBe(200);
    });
  });

  describe('/user-engagement/[userId]', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const response = await fetch(`${API_URL}/user-engagement/1`, { method: 'POST' });
      expect(response.status).toBe(405);
    });

    it('should return 404 Not Found for non-existent user', async () => {
      const response = await fetch(`${API_URL}/user-engagement/non-existent-user`);
      expect(response.status).toBe(404);
    });

    it('should return 200 OK on success', async () => {
      const response = await fetch(`${API_URL}/user-engagement/user-123`);
      expect(response.status).toBe(200);
    });
  });

  describe('/weekly-king', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const response = await fetch(`${API_URL}/weekly-king`, { method: 'POST' });
      expect(response.status).toBe(405);
    });

    it('should return 200 OK on success', async () => {
      const response = await fetch(`${API_URL}/weekly-king`);
      expect(response.status).toBe(200);
    });
  });
});
