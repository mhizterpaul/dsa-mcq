process.env.DATABASE_URL = "file:./test.db";
process.env.JWT_SECRET = 'test-secret';
import { createMocks } from 'node-mocks-http';
import registerHandler from '../../pages/api/auth/register';
import loginHandler from '../../pages/api/auth/login';
import { rawLogoutHandler as logoutHandler } from '../../pages/api/auth/logout';
import meHandler from '../../pages/api/me';
import { prisma } from '../../infra/prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'testuser',
};

const decodeToken = (token: string) => jwt.verify(token, process.env.JWT_SECRET!) as any;

describe('Auth Session Acceptance Tests (Real DB)', () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Full User Lifecycle and Session Management', async () => {
    // 1. Register
    const { req: regReq, res: regRes } = createMocks({
      method: 'POST',
      body: { email: testUser.email, password: testUser.password, name: testUser.name },
      headers: { 'user-agent': 'test-agent' },
    });
    await registerHandler(regReq, regRes, { prisma });
    expect(regRes._getStatusCode()).toBe(201);

    const user = await prisma.user.findUnique({ where: { email: testUser.email } });
    expect(user).toBeTruthy();
    expect(user?.name).toBe(testUser.name);

    // 2. Login from Client A
    const { req: reqA, res: resA } = createMocks({
      method: 'POST',
      body: { email: testUser.email, password: testUser.password },
      headers: { 'user-agent': 'client-a' },
    });
    await loginHandler(reqA, resA, { prisma });
    expect(resA._getStatusCode()).toBe(200);
    const { token: tokenA } = JSON.parse(resA._getData());
    const decodedA = decodeToken(tokenA);

    const sessionA = await prisma.session.findUnique({ where: { id: decodedA.sessionId } });
    expect(sessionA).toBeTruthy();
    expect(sessionA?.userAgent).toBe('client-a');

    // 3. Login from Client B
    const { req: reqB, res: resB } = createMocks({
      method: 'POST',
      body: { email: testUser.email, password: testUser.password },
      headers: { 'user-agent': 'client-b' },
    });
    await loginHandler(reqB, resB, { prisma });
    expect(resB._getStatusCode()).toBe(200);
    const { token: tokenB } = JSON.parse(resB._getData());
    expect(tokenA).not.toEqual(tokenB);

    // 4. Logout from Client A
    const { req: logoutReq, res: logoutRes } = createMocks({ method: 'POST' });
    (logoutReq as any).user = user;
    (logoutReq as any).sessionId = sessionA?.id;
    await logoutHandler(logoutReq as any, logoutRes, { prisma });
    expect(logoutRes._getStatusCode()).toBe(200);

    const sessionAAfter = await prisma.session.findUnique({ where: { id: sessionA?.id } });
    expect(sessionAAfter).toBeNull();

    // 5. Verify Token A is revoked
    const { req: revokedReq, res: revokedRes } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenA}` },
    });
    await meHandler(revokedReq, revokedRes);
    expect(revokedRes._getStatusCode()).toBe(401);

    // 6. Verify Token B is still valid
    const { req: stillValidReq, res: stillValidRes } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${tokenB}` },
    });
    // meHandler will use withAuth which will check the session in DB
    await meHandler(stillValidReq, stillValidRes);
    expect(stillValidRes._getStatusCode()).toBe(200);
  });

  test('should reject invalid login credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'wrong@example.com', password: 'wrong' },
    });
    await loginHandler(req, res, { prisma });
    expect(res._getStatusCode()).toBe(401);
  });

  test('should reject expired and tampered tokens', async () => {
    const expiredToken = jwt.sign({ user: { id: 'some-id' }, sessionId: 'some-session' }, process.env.JWT_SECRET!, { expiresIn: '-1s' });
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
    await logoutHandler(req as any, res, { prisma });
    expect(res._getStatusCode()).toBe(401);
  });
});
