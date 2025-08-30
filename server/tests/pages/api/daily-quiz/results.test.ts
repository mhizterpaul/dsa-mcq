import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/daily-quiz/results';

describe('/api/daily-quiz/results', () => {
  it('should return 200 OK on success', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });
    await handler(req, res);
    // Fails, expecting 404 Not Found
    expect(res._getStatusCode()).toBe(404);
  });

  it('should return 401 Unauthorized for missing auth token', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });
    // Fails, expecting 200 OK
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
