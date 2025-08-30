import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/auth/reset-password';

describe('/api/auth/reset-password', () => {
  it('should return a 500 error when resetting a password', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        token: 'test-token',
        password: 'new-password',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
