process.env.DATABASE_URL = "file:./test.db";
process.env.JWT_SECRET = 'test-secret';
process.env.USE_REAL_DB = 'true';

import { createMocks } from 'node-mocks-http';
import googleOAuthHandler from '../../pages/api/v1/oauth/google';
import githubOAuthHandler from '../../pages/api/v1/oauth/github';
import xOAuthHandler from '../../pages/api/v1/oauth/x';
import { prisma } from '../../infra/prisma/client';

describe('OAuth v1 Acceptance Tests (Real DB)', () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('POST /api/v1/oauth/google with mock code returns user and session token', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        code: 'mock-google-code',
        codeVerifier: 'mock-google-verifier',
        redirectUri: 'http://localhost:3000/auth/callback',
      },
    });

    await googleOAuthHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('test-google@example.com');
    expect(data.syncKey).toBeDefined();

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { email: 'test-google@example.com' },
    });
    expect(dbUser).toBeTruthy();
    expect(dbUser?.fullName).toBe('Test GOOGLE User');

    // Verify account exists in database
    const dbAccount = await prisma.account.findFirst({
      where: { userId: dbUser?.id },
    });
    expect(dbAccount).toBeTruthy();
    expect(dbAccount?.provider).toBe('google');
  });

  test('POST /api/v1/oauth/github with mock code returns user and session token', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        code: 'mock-github-code',
        codeVerifier: 'mock-github-verifier',
        redirectUri: 'com.dsamcq:/oauth',
      },
    });

    await githubOAuthHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('test-github@example.com');
    expect(data.syncKey).toBeDefined();

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { email: 'test-github@example.com' },
    });
    expect(dbUser).toBeTruthy();
    expect(dbUser?.fullName).toBe('Test GITHUB User');
  });

  test('POST /api/v1/oauth/x with mock code returns user and session token', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        code: 'mock-x-code',
        codeVerifier: 'mock-x-verifier',
        redirectUri: 'com.dsamcq:/oauth',
      },
    });

    await xOAuthHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('test-x@example.com');
    expect(data.syncKey).toBeDefined();

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { email: 'test-x@example.com' },
    });
    expect(dbUser).toBeTruthy();
    expect(dbUser?.fullName).toBe('Test X User');
  });

  test('POST rejects with 400 when code is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        codeVerifier: 'mock-google-verifier',
        redirectUri: 'http://localhost:3000/auth/callback',
      },
    });

    await googleOAuthHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});
