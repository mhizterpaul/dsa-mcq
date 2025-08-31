import fetch from 'node-fetch';
import { startServer, stopServer } from './test-utils';

const API_URL = 'http://localhost:3000/api/auth';

describe('/api/auth', () => {
  beforeAll(async () => {
    await startServer();
  });

  afterAll(() => {
    stopServer();
  });

  describe('/register', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const response = await fetch(`${API_URL}/register`, { method: 'GET' });
      expect(response.status).toBe(405);
    });

    it('should return 400 Bad Request if fields are missing', async () => {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com' }),
      });
      expect(response.status).toBe(400);
    });

    it('should return 409 Conflict if user already exists', async () => {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test', email: 'test@test.com', password: 'password' }),
      });
      expect(response.status).toBe(409);
    });

    it('should return 201 and user object on successful registration', async () => {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'newUser',
          email: `new-${Date.now()}@test.com`,
          password: 'password',
        }),
      });
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id');
      expect(body.user).toHaveProperty('name', 'newUser');
    });
  });

  describe('/signin', () => {
    it('should return 401 for invalid credentials', async () => {
      const response = await fetch(`${API_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'wrongpassword' }),
      });
      expect(response.status).toBe(401);
    });

    it('should return 200 and user object on successful signin', async () => {
      // This depends on the register test having run successfully in a real scenario
      const response = await fetch(`${API_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('user');
    });
  });

  describe('/provider-signin', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const response = await fetch(`${API_URL}/provider-signin`, { method: 'GET' });
      expect(response.status).toBe(405);
    });

    it('should return 400 Bad Request if token is missing', async () => {
      const response = await fetch(`${API_URL}/provider-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google' }),
      });
      expect(response.status).toBe(400);
    });

    it('should return 401 Unauthorized for invalid token', async () => {
      const response = await fetch(`${API_URL}/provider-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google', token: 'invalid-token' }),
      });
      expect(response.status).toBe(401);
    });

    it('should return 200 and user object on successful sign-in', async () => {
      const response = await fetch(`${API_URL}/provider-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google', token: 'valid-token' }),
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('user');
    });
  });

  describe('/request-password-reset', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const response = await fetch(`${API_URL}/request-password-reset`, { method: 'GET' });
      expect(response.status).toBe(405);
    });

    it('should return 400 Bad Request if email is missing', async () => {
      const response = await fetch(`${API_URL}/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(400);
    });

    it('should return 200 OK', async () => {
      const response = await fetch(`${API_URL}/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com' }),
      });
      expect(response.status).toBe(200);
    });
  });

  describe('/reset-password', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const response = await fetch(`${API_URL}/reset-password`, { method: 'GET' });
      expect(response.status).toBe(405);
    });

    it('should return 400 Bad Request if password is missing', async () => {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'valid-token' }),
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 Bad Request for invalid token', async () => {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'invalid-token', password: 'new-password' }),
      });
      expect(response.status).toBe(400);
    });

    it('should return 200 OK on successful password reset', async () => {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'valid-token-for-testing', password: 'new-password' }),
      });
      expect(response.status).toBe(200);
    });
  });
});
