import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { registerHandler } from '../../src/pages/api/auth/register';
import { PrismockClient } from 'prismock';
import { User } from '@prisma/client';
import { CacheService } from '../../src/services/cacheService';
import { MailService } from '../../src/services/mailService';
import { generateSignature } from '../../src/utils/signature';

// Mock MailService
jest.mock('../../src/services/mailService');
const MockMailService = MailService as jest.MockedClass<typeof MailService>;

describe('/api/auth/register', () => {
  let prismock: PrismockClient;
  let cacheService: CacheService;
  let mailService: jest.Mocked<MailService>;

  beforeAll(() => {
    prismock = new PrismockClient() as unknown as PrismockClient;
    cacheService = new CacheService();
    // @ts-ignore
    mailService = new MockMailService();
  });

  beforeEach(async () => {
    await prismock.user.deleteMany({});
    await prismock.verificationToken.deleteMany({});
  });

  const makeReqRes = (method: 'POST' | 'GET', options: { query?: any, body?: any, url?: string } = {}) => {
    const { req, res } = createMocks({ method, ...options });
    const signature = generateSignature(options.body || {});
    req.headers = { 'x-client-signature': signature };
    return { req: req as NextApiRequest, res: res as NextApiResponse };
  };

  it('should return 400 if name, email or password are not provided', async () => {
    const body = { name: 'test', email: 'test@test.com' };
    const { req, res } = makeReqRes('POST', { body });
    await registerHandler(req, res, prismock, cacheService, mailService);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 409 if user already exists', async () => {
    await prismock.user.create({
      data: {
        email: 'test@test.com',
        name: 'test',
        password: 'password',
      },
    });

    const body = { name: 'test', email: 'test@test.com', password: 'password' };
    const { req, res } = makeReqRes('POST', {
      body,
    });

    await registerHandler(req, res, prismock, cacheService, mailService);
    expect(res._getStatusCode()).toBe(409);
  });

  it('should create a new user and send a verification email', async () => {
    const body = { name: 'test', email: 'test@test.com', password: 'password' };
    const { req, res } = makeReqRes('POST', {
      body,
    });

    await registerHandler(req, res, prismock, cacheService, mailService);
    expect(res._getStatusCode()).toBe(201);

    const user = await prismock.user.findUnique({ where: { email: 'test@test.com' } });
    expect(user).not.toBeNull();
  });

  it('should verify user email and return tokens', async () => {
    const user = await prismock.user.create({
        data: {
          email: 'test@test.com',
          name: 'test',
          password: 'password',
        },
      });
    const verificationToken = await prismock.verificationToken.create({
        data: {
            identifier: user.id,
            token: 'test-token',
            expires: new Date(Date.now() + 3600000), // 1 hour
        }
    });

    const body = { verificationToken: 'test-token' };
    const { req, res } = makeReqRes('POST', {
        query: { verify: 'email' },
        body,
      });

    await registerHandler(req, res, prismock, cacheService, mailService);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.user.emailVerified).not.toBeNull();
    expect(data.accessToken).toBeDefined();
    expect(data.refreshToken).toBeDefined();
  });
});
