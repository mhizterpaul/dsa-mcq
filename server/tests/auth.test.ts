import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import registerHandler from '../src/pages/api/auth/register';
import loginHandler from '../src/pages/api/auth/login';
import resetPasswordHandler from '../src/pages/api/auth/reset-password';
import callbackHandler from '../src/pages/api/auth/callback';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

const prisma = new PrismaClient();

// This is a placeholder for Google provider, since the original is not available in test scope.
const Google = (options: any) => ({ id: 'google', ...options });

beforeAll(() => {
  process.env.AUTH_PROVIDERS = JSON.stringify([
    Google({
      clientId: "google-id-123",
      clientSecret: "dummy-google-secret",
      authorization: {
        url: "https://oauth-mock.mock.beeceptor.com/oauth/authorize",
      },
      token: {
        url: "https://oauth-mock.mock.beeceptor.com/oauth/token/google",
      },
      userinfo: {
        url: "https://oauth-mock.mock.beeceptor.com/userinfo/google",
      },
    }),
  ]);
});

// Mock the mail service
jest.mock('../src/services/mailService', () => {
  return {
    sendEmail: jest.fn((to: string, subject: string, body: string) => {
        const codeMatch = body.match(/code: (\w+)/);
        if (codeMatch) {
          (global as any).lastResetCode = codeMatch[1];
        }
        const tokenMatch = body.match(/token: (\w+)/);
        if (tokenMatch) {
          (global as any).lastVerificationToken = tokenMatch[1];
        }
        return Promise.resolve();
    }),
  };
});

// Mock Google Apis
jest.mock('googleapis', () => {
    const mockAuth = {
        getToken: jest.fn(),
        setCredentials: jest.fn(),
    };
    const mockOauth2 = {
        userinfo: {
            get: jest.fn(),
        },
    };
    return {
        google: {
            auth: {
                OAuth2: jest.fn(() => mockAuth),
            },
            oauth2: jest.fn(() => mockOauth2),
        },
    };
});

const mockedGoogle = google as jest.Mocked<typeof google>;

describe('/api/auth', () => {
  // A single, consistent mock request/response creator
  function makeReqRes(method: 'POST' | 'GET', options: { query?: any, body?: any, url?: string } = {}) {
    const { query = {}, body = {}, url = '' } = options;
    const { req, res } = createMocks({ method, query, body, url });
    // This is needed to make the mock req/res compatible with NextApiRequest/NextApiResponse
    req.headers = {};
    return { req: req as NextApiRequest, res: res as NextApiResponse };
  }

  beforeEach(async () => {
    // Clean the database before each test
    await prisma.verificationToken.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect the Prisma client after all tests
    await prisma.$disconnect();
  });

  describe('/register', () => {
    it('400 if email or password missing', async () => {
      let { req, res } = makeReqRes('POST', { body: { email: 'user@example.com' } });
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(400);

      ({ req, res } = makeReqRes('POST', { body: { password: 'pass123' } }));
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
    });

    it('400 if email malformed', async () => {
      const { req, res } = makeReqRes('POST', {
        body: {
          email: 'not-an-email',
          password: 'ValidPass123!',
        }
      });
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData()).message).toBe('Invalid email');
    });

    it('201 on initial registration, 200 on verification', async () => {
      // Step 1: Initial registration sends verification email
      let { req, res } = makeReqRes('POST', {
        body: {
          email: 'newuser@example.com',
          password: 'SecurePass123!',
        }
      });
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData()).message).toBe('Verification email sent');

      // Step 2: Use verification token to complete registration
      const verificationToken = (global as any).lastVerificationToken;
      expect(verificationToken).toBeDefined();

      ({ req, res } = makeReqRes('POST', {
        query: { verify: 'email' },
        body: { verificationToken },
      }));
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(200);

      const data = JSON.parse(res._getData());
      expect(data).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          id: expect.any(String),
          email: 'newuser@example.com',
        },
      });
    });

    it('409 if user already registered', async () => {
      await prisma.user.create({
        data: {
          email: 'existing@example.com',
          password: 'hashedpassword',
        }
      });

      const { req, res } = makeReqRes('POST', { body: { email: 'existing@example.com', password: 'AnotherPass123!' } });
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(409);
      expect(JSON.parse(res._getData()).message).toBe('User already exists');
    });
  });

  describe('/login', () => {
    it('returns 401 if credentials are invalid', async () => {
      const { req, res } = makeReqRes('POST', {
        body: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        }
      });
      await loginHandler(req, res);
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData()).message).toBe('Invalid credentials');
    });
  });

  describe('/reset-password', () => {
    it('full flow: registers, resets password, and logs in with new password', async () => {
      const email = 'resetuser@example.com';
      const oldPassword = 'OldPass123!';
      const newPassword = 'NewPass456!';

      // Step 1: Register user
      let { req, res } = makeReqRes('POST', { body: { email, password: oldPassword } });
      await registerHandler(req, res);
      const verificationToken = (global as any).lastVerificationToken;
      ({ req, res } = makeReqRes('POST', { query: { verify: 'email' }, body: { verificationToken } }));
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(200);
      const { user } = JSON.parse(res._getData());
      const userId = user.id;

      // Step 2: Request password reset (sends email)
      ({ req, res } = makeReqRes('POST', { body: { email } }));
      await resetPasswordHandler(req, res);
      expect(res._getStatusCode()).toBe(200);

      // Step 3: Use reset code to set new password
      const resetCode = (global as any).lastResetCode;
      expect(resetCode).toBeDefined();
      ({ req, res } = makeReqRes('POST', {
        query: { userId, token: resetCode },
        body: { password: newPassword },
      }));
      await resetPasswordHandler(req, res);
      expect(res._getStatusCode()).toBe(200);

      // Step 4: Login with new password
      ({ req, res } = makeReqRes('POST', { body: { email, password: newPassword } }));
      await loginHandler(req, res);
      expect(res._getStatusCode()).toBe(200);

      const loginData = JSON.parse(res._getData());
      expect(loginData).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          email,
        },
      });
    });
  });

  describe('/callback', () => {
    it('handles a valid OAuth callback, creates a new user, and returns tokens', async () => {
      const code = 'valid-code';
      const tokens = { access_token: 'test-access-token' };
      const userInfo = { email: 'oauthuser@example.com', name: 'OAuth User', picture: 'test.jpg' };

      (mockedGoogle.auth.OAuth2().getToken as jest.Mock).mockResolvedValue({ tokens });
      (mockedGoogle.oauth2().userinfo.get as jest.Mock).mockResolvedValue({ data: userInfo });

      const { req, res } = makeReqRes('GET', { query: { code } });
      await callbackHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.user.email).toBe(userInfo.email);
      expect(data.accessToken).toBeDefined();
    });

    it('handles a valid OAuth callback for an existing user', async () => {
        const code = 'valid-code';
        const tokens = { access_token: 'test-access-token' };
        const userInfo = { email: 'existingoauth@example.com', name: 'Existing OAuth User' };

        await prisma.user.create({ data: { email: userInfo.email, name: userInfo.name } });

        (mockedGoogle.auth.OAuth2().getToken as jest.Mock).mockResolvedValue({ tokens });
        (mockedGoogle.oauth2().userinfo.get as jest.Mock).mockResolvedValue({ data: userInfo });

        const { req, res } = makeReqRes('GET', { query: { code } });
        await callbackHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.user.email).toBe(userInfo.email);
    });

    it('returns a 400 error for an invalid code', async () => {
        const code = 'invalid-code';
        (mockedGoogle.auth.OAuth2().getToken as jest.Mock).mockRejectedValue(new Error('Invalid code'));

        const { req, res } = makeReqRes('GET', { query: { code } });
        await callbackHandler(req, res);

        expect(res._getStatusCode()).toBe(500);
    });
  });
});
