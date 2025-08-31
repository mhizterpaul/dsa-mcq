import request from 'supertest';
import syncHandler from '../src/pages/api/sync';

describe('/api/sync', () => {
  it('should return 405 Method Not Allowed for non-POST requests', async () => {
    const { status } = await request(syncHandler).get('/');
    expect(status).toBe(405);
  });

  it('should return 200 OK for an empty body', async () => {
    const { status } = await request(syncHandler)
      .post('/')
      .send({});
    expect(status).toBe(200);
  });

  it('should return 200 OK and synced data on success', async () => {
    const { status } = await request(syncHandler)
      .post('/')
      .send({
        user_engagement: [{ userId: 'user-123', xp_progress: 2000, updatedAt: Date.now() }],
      });
    expect(status).toBe(200);
  });
});
