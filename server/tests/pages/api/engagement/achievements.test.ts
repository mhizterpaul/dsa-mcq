import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/engagement/achievements';

describe('/api/engagement/achievements', () => {
  it('should return a 500 error when fetching achievements', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
