import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/learning/featured-categories';

describe('/api/learning/featured-categories', () => {
  it('should return a 500 error when fetching featured categories', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
