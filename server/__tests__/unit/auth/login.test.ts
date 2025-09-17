import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { loginHandler } from '../../src/pages/api/auth/login';
import { PrismockClient } from 'prismock';
import argon2 from 'argon2';
import { User } from '@prisma/client';
import { CacheService } from '../../src/services/cacheService';
import { generateSignature } from '../../src/utils/signature';

describe('/api/auth/login', () => {
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
    const signature = generateSignature(options.body || {});
    req.headers = { 'x-client-signature': signature };
    return { req: req as NextApiRequest, res: res as NextApiResponse };
  };

  it('should return 400 if email or password are not provided', async () => {
    const body = { email: 'test@test.com' };
    const { req, res } = makeReqRes('POST', { body });
    await loginHandler(req, res, prismock, cacheService);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 401 for a non-existent user', async () => {
    const body = { email: 'no-user@test.com', password: 'password' };
    const { req, res } = makeReqRes('POST', {
      body,
    });

    await loginHandler(req, res, prismock, cacheService);
    expect(res._getStatusCode()).toBe(401);
  });

  it('should return 401 for wrong password', async () => {
    const hashedPassword = await argon2.hash('password');
    await prismock.user.create({
      data: {
        email: 'test@test.com',
        name: 'test',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    const body = { email: 'test@test.com', password: 'wrong-password' };
    const { req, res } = makeReqRes('POST', {
      body,
    });

    await loginHandler(req, res, prismock, cacheService);
    expect(res._getStatusCode()).toBe(401);
  });

  it('should return 200 and tokens for successful login', async () => {
    const hashedPassword = await argon2.hash('password');
    await prismock.user.create({
      data: {
        email: 'test@test.com',
        name: 'test',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    const body = { email: 'test@test.com', password: 'password' };
    const { req, res } = makeReqRes('POST', {
      body,
    });

    await loginHandler(req, res, prismock, cacheService);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.accessToken).toBeDefined();
    expect(data.refreshToken).toBeDefined();
    expect(data.user.email).toBe('test@test.com');
  });
});
