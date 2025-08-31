import request from 'supertest';
import achievementsHandler from '../src/pages/api/engagement/achievements';
import leaderboardHandler from '../src/pages/api/engagement/leaderboard';
import userEngagementHandler from '../src/pages/api/engagement/user-engagement/[userId]';
import weeklyKingHandler from '../src/pages/api/engagement/weekly-king';

describe('/api/engagement', () => {
  describe('/achievements', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const { status } = await request(achievementsHandler).post('/');
      expect(status).toBe(405);
    });

    it('should return 200 OK on success', async () => {
      const { status } = await request(achievementsHandler).get('/');
      expect(status).toBe(200);
    });
  });

  describe('/leaderboard', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const { status } = await request(leaderboardHandler).post('/');
      expect(status).toBe(405);
    });

    it('should return 200 OK on success', async () => {
      const { status } = await request(leaderboardHandler).get('/');
      expect(status).toBe(200);
    });
  });

  describe('/user-engagement/[userId]', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
        const { status } = await request(userEngagementHandler).post('/?userId=1');
        expect(status).toBe(405);
    });

    it('should return 404 Not Found for non-existent user', async () => {
        const { status } = await request(userEngagementHandler).get('/?userId=non-existent-user');
        expect(status).toBe(404);
    });

    it('should return 200 OK on success', async () => {
        const { status } = await request(userEngagementHandler).get('/?userId=user-123');
        expect(status).toBe(200);
    });
  });

  describe('/weekly-king', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const { status } = await request(weeklyKingHandler).post('/');
      expect(status).toBe(405);
    });

    it('should return 200 OK on success', async () => {
      const { status } = await request(weeklyKingHandler).get('/');
      expect(status).toBe(200);
    });
  });
});
