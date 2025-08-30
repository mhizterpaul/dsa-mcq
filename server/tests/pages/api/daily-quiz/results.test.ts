import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/daily-quiz/results';

describe('/api/daily-quiz/results', () => {
  it('should return a 500 error when fetching results', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
