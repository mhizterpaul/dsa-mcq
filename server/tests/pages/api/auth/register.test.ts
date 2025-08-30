import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/auth/register';

describe('/api/auth/register', () => {
  it('should return a 500 error when registering a user', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
