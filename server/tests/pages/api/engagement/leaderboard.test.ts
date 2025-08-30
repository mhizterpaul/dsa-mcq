import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/engagement/leaderboard';

describe('/api/engagement/leaderboard', () => {
  it('should return a 500 error when fetching the leaderboard', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
