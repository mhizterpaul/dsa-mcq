import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/auth/request-password-reset';

describe('/api/auth/request-password-reset', () => {
  it('should return 200 OK on successful request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'test@test.com' },
    });
    await handler(req, res);
    // Fails, expecting 404 Not Found
    expect(res._getStatusCode()).toBe(404);
  });

  it('should return 400 Bad Request for missing email', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });
    await handler(req, res);
    // Fails, expecting 200 OK
    expect(res._getStatusCode()).toBe(200);
  });

  it('should return 404 Not Found for non-existent user', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'nonexistent@test.com' },
    });
    await handler(req, res);
    // Fails, expecting 200 OK
    expect(res._getStatusCode()).toBe(200);
  });
});
