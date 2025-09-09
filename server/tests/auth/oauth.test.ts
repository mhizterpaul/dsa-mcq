import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { callbackHandler } from '../../src/pages/api/auth/callback';
import { PrismockClient } from 'prismock';
import { google } from 'googleapis';
import { CacheService } from '../../src/services/cacheService';

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

describe('/api/auth/callback', () => {
    let prismock: PrismockClient;
    let cacheService: CacheService;

    beforeAll(() => {
        prismock = new PrismockClient() as unknown as PrismockClient;
        cacheService = new CacheService();
    });

    beforeEach(async () => {
        await prismock.user.deleteMany({});
    });

    const makeReqRes = (method: 'POST' | 'GET', options: { query?: any, body?: any, url?: string } = {}) => {
        const { req, res } = createMocks({ method, ...options });
        req.headers = {};
        return { req: req as NextApiRequest, res: res as NextApiResponse };
      };

    it('handles a valid OAuth callback, creates a new user, and returns tokens', async () => {
        const code = 'valid-code';
        const tokens = { access_token: 'test-access-token' };
        const userInfo = { email: 'oauthuser@example.com', name: 'OAuth User', picture: 'test.jpg' };

        (mockedGoogle.auth.OAuth2().getToken as jest.Mock).mockResolvedValue({ tokens });
        (mockedGoogle.oauth2().userinfo.get as jest.Mock).mockResolvedValue({ data: userInfo });

        const { req, res } = makeReqRes('GET', { query: { code } });
        await callbackHandler(req, res, prismock, cacheService);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.user.email).toBe(userInfo.email);
        expect(data.accessToken).toBeDefined();
    });

    it('handles a valid OAuth callback for an existing user', async () => {
        const code = 'valid-code';
        const tokens = { access_token: 'test-access-token' };
        const userInfo = { email: 'existingoauth@example.com', name: 'Existing OAuth User' };

        await prismock.user.create({ data: { email: userInfo.email, name: userInfo.name } });

        (mockedGoogle.auth.OAuth2().getToken as jest.Mock).mockResolvedValue({ tokens });
        (mockedGoogle.oauth2().userinfo.get as jest.Mock).mockResolvedValue({ data: userInfo });

        const { req, res } = makeReqRes('GET', { query: { code } });
        await callbackHandler(req, res, prismock, cacheService);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.user.email).toBe(userInfo.email);
    });

    it('returns a 500 error for an invalid code', async () => {
        const code = 'invalid-code';
        (mockedGoogle.auth.OAuth2().getToken as jest.Mock).mockRejectedValue(new Error('Invalid code'));

        const { req, res } = makeReqRes('GET', { query: { code } });
        await callbackHandler(req, res, prismock, cacheService);

        expect(res._getStatusCode()).toBe(500);
    });
});
