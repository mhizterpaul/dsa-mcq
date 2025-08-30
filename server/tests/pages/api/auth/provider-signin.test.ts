import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/auth/provider-signin';

describe('/api/auth/provider-signin', () => {
  it('should return a 500 error when signing in with a provider', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        provider: 'google',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
