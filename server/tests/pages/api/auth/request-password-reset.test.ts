import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/auth/request-password-reset';

describe('/api/auth/request-password-reset', () => {
  it('should return a 500 error when requesting a password reset', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
