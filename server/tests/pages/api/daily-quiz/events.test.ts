import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/daily-quiz/events';

describe('/api/daily-quiz/events', () => {
  it('should return a 500 error when fetching events', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
