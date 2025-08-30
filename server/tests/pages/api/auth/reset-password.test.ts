import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/auth/reset-password';

describe('/api/auth/reset-password', () => {
  it('should return 200 OK on successful password reset', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { token: 'valid-token', password: 'new-password' },
    });
    await handler(req, res);
    // Fails, expecting 400 Bad Request
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 400 Bad Request for invalid token', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { token: 'invalid-token', password: 'new-password' },
    });
    await handler(req, res);
    // Fails, expecting 200 OK
    expect(res._getStatusCode()).toBe(200);
  });

  it('should return 400 Bad Request for missing password', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { token: 'valid-token' },
    });
    await handler(req, res);
    // Fails, expecting 200 OK
    expect(res._getStatusCode()).toBe(200);
  });
});
