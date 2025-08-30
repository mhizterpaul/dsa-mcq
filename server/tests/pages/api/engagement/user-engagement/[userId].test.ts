import { createMocks } from 'node-mocks-http';
import handler from '../../../../../pages/api/engagement/user-engagement/[userId]';

describe('/api/engagement/user-engagement/[userId]', () => {
  it('should return a 500 error when fetching user engagement', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        userId: '1',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
