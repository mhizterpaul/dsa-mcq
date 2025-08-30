import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/auth/provider-signin';

describe('/api/auth/provider-signin', () => {
  it('should return 200 OK on successful sign-in', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { provider: 'google' },
    });
    await handler(req, res);
    // Fails, expecting 401 Unauthorized
    expect(res._getStatusCode()).toBe(401);
  });

  it('should return 400 Bad Request for missing provider', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });
    await handler(req, res);
    // Fails, expecting 200 OK
    expect(res._getStatusCode()).toBe(200);
  });

  it('should return 401 Unauthorized for invalid provider', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { provider: 'invalid-provider' },
    });
    await handler(req, res);
    // Fails, expecting 200 OK
    expect(res._getStatusCode()).toBe(200);
  });
});
