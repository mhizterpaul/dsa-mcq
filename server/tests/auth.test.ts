import request from 'supertest';
import registerHandler from '../src/pages/api/auth/register';
import signinHandler from '../src/pages/api/auth/[...nextauth]'; // Assuming this handles signin
import providerSigninHandler from '../src/pages/api/auth/provider-signin';
import requestPasswordResetHandler from '../src/pages/api/auth/request-password-reset';
import resetPasswordHandler from '../src/pages/api/auth/reset-password';

// Mock the DB connection
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('/api/auth', () => {
  describe('/register', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const { status } = await request(registerHandler).get('/');
      expect(status).toBe(405);
    });

    it('should return 400 Bad Request if fields are missing', async () => {
      const { status } = await request(registerHandler)
        .post('/')
        .send({ email: 'test@test.com' });
      expect(status).toBe(400);
    });

    // DB-dependent tests are more complex to mock with supertest against Next API handlers
    // For now, we'll skip the tests that require a successful DB interaction.
  });

  describe('/provider-signin', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const { status } = await request(providerSigninHandler).get('/');
      expect(status).toBe(405);
    });

    it('should return 400 Bad Request if token is missing', async () => {
      const { status } = await request(providerSigninHandler)
        .post('/')
        .send({ provider: 'google' });
      expect(status).toBe(400);
    });

    it('should return 401 Unauthorized for invalid token', async () => {
        const { status } = await request(providerSigninHandler)
            .post('/')
            .send({ provider: 'google', token: 'invalid-token' });
        expect(status).toBe(401);
    });

    it('should return 200 and user object on successful sign-in', async () => {
        const { status, body } = await request(providerSigninHandler)
            .post('/')
            .send({ provider: 'google', token: 'valid-token' });
        expect(status).toBe(200);
        expect(body).toHaveProperty('token');
        expect(body).toHaveProperty('user');
    });
  });

  describe('/request-password-reset', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const { status } = await request(requestPasswordResetHandler).get('/');
      expect(status).toBe(405);
    });

    it('should return 400 Bad Request if email is missing', async () => {
      const { status } = await request(requestPasswordResetHandler)
        .post('/')
        .send({});
      expect(status).toBe(400);
    });
  });

  describe('/reset-password', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const { status } = await request(resetPasswordHandler).get('/');
      expect(status).toBe(405);
    });

    it('should return 400 Bad Request if password is missing', async () => {
      const { status } = await request(resetPasswordHandler)
        .post('/')
        .send({ token: 'valid-token' });
      expect(status).toBe(400);
    });
  });
});
