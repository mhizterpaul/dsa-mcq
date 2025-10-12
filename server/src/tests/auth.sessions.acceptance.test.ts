import { createMocks } from 'node-mocks-http';
import registerHandler from '../pages/api/auth/register';
import loginHandler from '../pages/api/auth/login';
import { rawLogoutHandler as logoutHandler } from '../pages/api/auth/logout';
import meHandler from '../pages/api/me';
import { prisma } from '../infra/prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

// Properly typed mock
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

jest.mock('../infra/prisma/client');

const testUser = {
  id: 'test-id',
  email: 'test@example.com',
  password: 'password123',
  name: 'testuser',
  role: 'USER',
  emailVerified: new Date(),
};

process.env.JWT_SECRET = 'test-secret';

const decodeToken = (token: string) => jwt.verify(token, process.env.JWT_SECRET!) as any;

describe('Auth Session Acceptance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Full User Lifecycle and Session Management', async () => {
    // 1. Register
    const regSession = { id: 'reg-session-id', userId: testUser.id };
    mockedPrisma.user.create.mockResolvedValue(testUser);
    mockedPrisma.session.create.mockResolvedValueOnce(regSession);
    const { req: regReq, res: regRes } = createMocks({
      method: 'POST',
      body: { email: testUser.email, password: testUser.password, name: testUser.name },
      headers: { 'user-agent': 'test-agent' },
    });
    await registerHandler(regReq, regRes, { prisma: mockedPrisma });
    expect(regRes._getStatusCode()).toBe(201);
    expect(mockedPrisma.user.create).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: testUser.id,
          userAgent: 'test-agent',
        }),
      })
    );

    // 2. Login from Client A
    const hashedPassword = await argon2.hash(testUser.password);
    mockedPrisma.user.findUnique.mockResolvedValue({ ...testUser, password: hashedPassword });
    const sessionA = { id: 'session-a-id', userId: testUser.id, userAgent: 'client-a' };
    mockedPrisma.session.create.mockResolvedValueOnce(sessionA);
    const { req: reqA, res: resA } = createMocks({
      method: 'POST',
      body: { email: testUser.email, password: testUser.password },
      headers: { 'user-agent': 'client-a' },
    });
    await loginHandler(reqA, resA, { prisma: mockedPrisma });
    const { token: tokenA } = JSON.parse(resA._getData());
    const decodedA = decodeToken(tokenA);
    expect(decodedA.sessionId).toBe(sessionA.id);

    // 3. Login from Client B
    const sessionB = { id: 'session-b-id', userId: testUser.id, userAgent: 'client-b' };
    mockedPrisma.session.create.mockResolvedValueOnce(sessionB);
    const { req: reqB, res: resB } = createMocks({
      method: 'POST',
      body: { email: testUser.email, password: testUser.password },
      headers: { 'user-agent': 'client-b' },
    });
    await loginHandler(reqB, resB, { prisma: mockedPrisma });
    const { token: tokenB } = JSON.parse(resB._getData());
    expect(tokenA).not.toEqual(tokenB);

    // 4. Logout from Client A
    const { req: logoutReq, res: logoutRes } = createMocks({ method: 'POST' });
    logoutReq.user = testUser;
    logoutReq.sessionId = sessionA.id;
    await logoutHandler(logoutReq, logoutRes, { prisma: mockedPrisma });
    expect(logoutRes._getStatusCode()).toBe(200);
    expect(mockedPrisma.session.delete).toHaveBeenCalledWith({ where: { id: sessionA.id } });
    expect(mockedPrisma.session.delete).toHaveBeenCalledTimes(1);

    // 5. Verify Token A is revoked
    mockedPrisma.session.findFirst.mockResolvedValue(null);
    const { req: revokedReq, res: revokedRes } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
    });
    await meHandler(revokedReq, revokedRes);
    expect(revokedRes._getStatusCode()).toBe(401);

    // 6. Verify Token B is still valid
    mockedPrisma.session.findFirst.mockResolvedValue(sessionB);
    const { req: stillValidReq, res: stillValidRes } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenB}` },
    });
    stillValidReq.user = testUser;
    await meHandler(stillValidReq, stillValidRes);
    expect(stillValidRes._getStatusCode()).toBe(200);
  });

  test('should reject invalid login credentials', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'wrong@example.com', password: 'wrong' },
    });
    await loginHandler(req, res, { prisma: mockedPrisma });
    expect(res._getStatusCode()).toBe(401);
  });

  test('should reject expired and tampered tokens', async () => {
    const expiredToken = jwt.sign({ user: testUser, sessionId: 'some-session' }, process.env.JWT_SECRET!, { expiresIn: '-1s' });
    const { req: expReq, res: expRes } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${expiredToken}` },
    });
    await meHandler(expReq, expRes);
    expect(expRes._getStatusCode()).toBe(401);

    const invalidToken = 'this-is-not-a-real-token';
    const { req: invReq, res: invRes } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${invalidToken}` },
    });
    await meHandler(invReq, invRes);
    expect(invRes._getStatusCode()).toBe(401);
  });

  test('should gracefully handle logout with an invalid token', async () => {
    const { req, res } = createMocks({ method: 'POST' });
    // No user or sessionId attached to simulate an invalid token scenario
    await logoutHandler(req, res, { prisma: mockedPrisma });
    expect(res._getStatusCode()).toBe(401);
  });
});