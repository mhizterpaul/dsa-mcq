import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/daily-quiz/session';

describe('/api/daily-quiz/session', () => {
  it('should return a 500 error when fetching the session', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
