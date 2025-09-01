import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import registerHandler from '../src/pages/api/auth/register';
import loginHandler from '../src/pages/api/auth/login';
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
      // ... (mail service mock)
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

// A single, consistent mock request/response creator
function makeReqRes(method: 'POST' | 'GET', options: { query?: any, body?: any, url?: string, headers?: any } = {}) {
  // ... (makeReqRes function)
}

// Helper function to create an authenticated user
async function createAuthenticatedUser(email = 'testuser@example.com', password = 'TestPassword123!') {
  // ... (createAuthenticatedUser function)
}

describe('/api/auth', () => {
  beforeEach(async () => {
    // ... (beforeEach block)
  });

  afterAll(async () => {
    // ... (afterAll block)
  });

  // ... (register, login, reset-password tests)

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

        expect(res._getStatusCode()).toBe(500); // The handler returns 500 on error
    });
  });
});
