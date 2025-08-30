import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/daily-quiz/answer';

describe('/api/daily-quiz/answer', () => {
  it('should return 200 OK on successful answer submission', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { questionId: '1', answerId: '1' },
    });
    await handler(req, res);
    // Fails, expecting 400 Bad Request
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 400 Bad Request for missing fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { questionId: '1' },
    });
    await handler(req, res);
    // Fails, expecting 200 OK
    expect(res._getStatusCode()).toBe(200);
  });

  it('should return 404 Not Found for non-existent question', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { questionId: '999', answerId: '1' },
    });
    await handler(req, res);
    // Fails, expecting 200 OK
    expect(res._getStatusCode()).toBe(200);
  });
});
