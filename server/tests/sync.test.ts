import fetch from 'node-fetch';
import { startServer, stopServer } from './test-utils';

const API_URL = 'http://localhost:3000/api/sync';

describe('/api/sync', () => {
  beforeAll(async () => {
    await startServer();
  });

  afterAll(() => {
    stopServer();
  });

  it('should return 405 Method Not Allowed for non-POST requests', async () => {
    const response = await fetch(API_URL, { method: 'GET' });
    expect(response.status).toBe(405);
  });

  it('should return 200 OK for an empty body', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(200);
  });

  it('should return 200 OK and synced data on success', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_engagement: [{ userId: 'user-123', xp_progress: 2000, updatedAt: Date.now() }],
      }),
    });
    expect(response.status).toBe(200);
  });
});
