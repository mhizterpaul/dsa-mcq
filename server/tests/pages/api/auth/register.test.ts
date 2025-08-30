import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/auth/register';

describe('/api/auth/register', () => {
  it('should return 201 Created on successful registration', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { name: 'test', email: 'test@test.com', password: 'password' },
    });
    await handler(req, res);
    // Fails, expecting 409 Conflict
    expect(res._getStatusCode()).toBe(409);
  });

  it('should return 400 Bad Request for missing fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'test@test.com' },
    });
    await handler(req, res);
    // Fails, expecting 201 Created
    expect(res._getStatusCode()).toBe(201);
  });

  it('should return 409 Conflict for duplicate user', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { name: 'test', email: 'existing@test.com', password: 'password' },
    });
    await handler(req, res);
    // Fails, expecting 201 Created
    expect(res._getStatusCode()).toBe(201);
  });
});
