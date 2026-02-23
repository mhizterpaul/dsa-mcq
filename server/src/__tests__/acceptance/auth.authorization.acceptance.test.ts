import { createMocks } from 'node-mocks-http';
import meHandler from '../../pages/api/me';
import syncHandler from '../../pages/api/sync';
import questionsHandler from '../../pages/api/learning/questions';
import devopsHandler from '../../pages/api/analytics/devops';
import { actionHandler } from '../../pages/api/engagement/action';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';

jest.mock('../../infra/prisma/client');
jest.mock('../../infra/cacheService');

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

const testUser = {
  id: 'test-id',
  email: 'test@example.com',
  name: 'testuser',
  role: 'USER',
};

const adminUser = {
    id: 'admin-id',
    email: 'admin@example.com',
    name: 'adminuser',
    role: 'admin',
};

process.env.JWT_SECRET = 'test-secret';

describe('Cross-Endpoint Authorization Enforcement', () => {
  const protectedEndpoints = [
    { name: 'me', handler: meHandler },
    { name: 'sync', handler: syncHandler },
    { name: 'questions', handler: questionsHandler },
    { name: 'devops', handler: devopsHandler },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each(protectedEndpoints)(
    '$name rejects unauthenticated access (no token)',
    async ({ handler }) => {
      const { req, res } = createMocks({ method: 'GET' });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects malformed authorization header (missing Bearer prefix)',
    async ({ handler }) => {
      const token = jwt.sign({ user: testUser, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: token },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
    }
  );

  test.each(protectedEndpoints)(
    '$name allows lowercase bearer prefix',
    async ({ name, handler }) => {
      mockedPrisma.session.findFirst.mockResolvedValue({ id: 'sess-1', userId: testUser.id });
      const token = jwt.sign({ user: testUser, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `bearer ${token}` },
      });
      await handler(req, res);

      // For endpoints with additional checks (roles, signatures), they might return 403
      // but they should NOT return 401.
      if (name === 'devops' || name === 'sync') {
          expect(res._getStatusCode()).toBe(403);
      } else {
          expect(res._getStatusCode()).toBe(200);
      }
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects invalid/tampered token',
    async ({ handler }) => {
      const invalidToken = jwt.sign({ user: testUser, sessionId: 'sess-1' }, 'wrong-secret');
      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `Bearer ${invalidToken}` },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects revoked session (session deleted from DB)',
    async ({ handler }) => {
      mockedPrisma.session.findFirst.mockResolvedValue(null);
      const token = jwt.sign({ user: testUser, sessionId: 'revoked-sess' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `Bearer ${token}` },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      expect(mockedPrisma.session.findFirst).toHaveBeenCalled();
    }
  );

  test('devops endpoint enforces admin role', async () => {
    mockedPrisma.session.findFirst.mockResolvedValue({ id: 'sess-1', userId: testUser.id });
    const userToken = jwt.sign({ user: testUser, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${userToken}` },
    });
    await devopsHandler(req, res);
    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Forbidden: Admins only' });
  });

  test('devops endpoint allows admin access', async () => {
    mockedPrisma.session.findFirst.mockResolvedValue({ id: 'sess-2', userId: adminUser.id });
    mockedPrisma.devOpsMetric.findMany.mockResolvedValue([]);
    const adminToken = jwt.sign({ user: adminUser, sessionId: 'sess-2' }, process.env.JWT_SECRET!);
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    await devopsHandler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });

  test('actionHandler rejects unauthenticated access (using getAuthenticatedUser)', async () => {
      const { req, res } = createMocks({ method: 'POST', body: { xp: 10 } });
      await actionHandler(req, res, { updateUserXP: jest.fn() } as any);
      expect(res._getStatusCode()).toBe(401);
  });

  test('actionHandler rejects revoked session (using getAuthenticatedUser)', async () => {
      mockedPrisma.session.findFirst.mockResolvedValue(null);
      const token = jwt.sign({ user: testUser, sessionId: 'revoked-sess' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: { xp: 10 },
      });
      await actionHandler(req, res, { updateUserXP: jest.fn() } as any);
      expect(res._getStatusCode()).toBe(401);
      expect(mockedPrisma.session.findFirst).toHaveBeenCalled();
  });
});
