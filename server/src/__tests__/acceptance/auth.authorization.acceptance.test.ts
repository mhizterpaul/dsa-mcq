import { createMocks } from 'node-mocks-http';
import meHandler from '../../pages/api/user/me';
import syncHandler from '../../pages/api/sync';
import questionsHandler from '../../pages/api/learning/questions';
import devopsHandler from '../../pages/api/analytics/devops';
import { actionHandler } from '../../pages/api/engagement/action';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';

jest.mock('../../infra/prisma/client', () => ({
  prisma: {
    session: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    devOpsMetric: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    engagement: {
      createMany: jest.fn(),
      aggregate: jest.fn().mockResolvedValue({ _avg: { xp: 0 } }),
    },
    question: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    category: {
        findMany: jest.fn().mockResolvedValue([]),
    }
  },
}));
jest.mock('../../infra/cacheService');

const mockedPrisma = prisma as any;

const testUser = {
  id: 'test-id',
  email: 'test@example.com',
  name: 'testuser',
  role: 'user',
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
    { name: 'action', handler: async (req: any, res: any) => actionHandler(req, res, { updateUserXP: jest.fn() } as any) },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const assertNoBusinessLogic = () => {
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
    expect(mockedPrisma.user.updateMany).not.toHaveBeenCalled();
    expect(mockedPrisma.devOpsMetric.findMany).not.toHaveBeenCalled();
    expect(mockedPrisma.devOpsMetric.create).not.toHaveBeenCalled();
    expect(mockedPrisma.engagement.createMany).not.toHaveBeenCalled();
  };

  test.each(protectedEndpoints)(
    '$name rejects unauthenticated access (no token)',
    async ({ name, handler }) => {
      const { req, res } = createMocks({
          method: name === 'action' || name === 'sync' ? 'POST' : 'GET'
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      assertNoBusinessLogic();
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects malformed authorization header (missing Bearer prefix)',
    async ({ name, handler }) => {
      const token = jwt.sign({ user: testUser, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: token },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      assertNoBusinessLogic();
    }
  );

  test.each(protectedEndpoints)(
    '$name allows lowercase bearer prefix',
    async ({ name, handler }) => {
      mockedPrisma.session.findFirst.mockResolvedValue({
          id: 'sess-1',
          userId: testUser.id,
          user: testUser
      } as any);
      const token = jwt.sign({ user: testUser, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `bearer ${token}` },
        query: name === 'questions' ? { categoryId: 'cat-1' } : {},
        body: name === 'action' ? { xp: 10 } : {},
      });
      await handler(req, res);

      if (name === 'devops' || name === 'sync') {
          expect(res._getStatusCode()).toBe(403);
      } else {
          expect(res._getStatusCode()).toBe(200);
      }
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects invalid/tampered token (wrong secret)',
    async ({ name, handler }) => {
      const invalidToken = jwt.sign({ user: testUser, sessionId: 'sess-1' }, 'wrong-secret');
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `Bearer ${invalidToken}` },
        body: name === 'action' ? { xp: 10 } : {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      assertNoBusinessLogic();
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects expired token',
    async ({ name, handler }) => {
      const expiredToken = jwt.sign(
        { user: testUser, sessionId: 'sess-1' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' }
      );
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `Bearer ${expiredToken}` },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      assertNoBusinessLogic();
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects token with missing sessionId',
    async ({ name, handler }) => {
      const invalidToken = jwt.sign({ user: testUser }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `Bearer ${invalidToken}` },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      assertNoBusinessLogic();
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects revoked session (session deleted from DB)',
    async ({ name, handler }) => {
      mockedPrisma.session.findFirst.mockResolvedValue(null);
      const token = jwt.sign({ user: testUser, sessionId: 'revoked-sess' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `Bearer ${token}` },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      expect(mockedPrisma.session.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'revoked-sess', userId: testUser.id }
      }));
      assertNoBusinessLogic();
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects session with missing user record in DB',
    async ({ name, handler }) => {
      mockedPrisma.session.findFirst.mockResolvedValue({
          id: 'sess-1',
          userId: testUser.id,
          user: null // User deleted from DB but session remains
      } as any);
      const token = jwt.sign({ user: testUser, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `Bearer ${token}` },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      assertNoBusinessLogic();
    }
  );

  test.each(protectedEndpoints)(
    '$name handles database failure gracefully (returns sanitized 500)',
    async ({ name, handler }) => {
      mockedPrisma.session.findFirst.mockRejectedValue(new Error('Internal Database Error'));
      const token = jwt.sign({ user: testUser, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `Bearer ${token}` },
        body: name === 'action' ? { xp: 10 } : {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Internal Server Error');
      expect(data.error).toBeUndefined(); // No leak
      assertNoBusinessLogic();
    }
  );

  test('devops endpoint enforces admin role (using DB role)', async () => {
    mockedPrisma.session.findFirst.mockResolvedValue({
        id: 'sess-1',
        userId: testUser.id,
        user: { ...testUser, role: 'user' }
    } as any);

    const userToken = jwt.sign({ user: testUser, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${userToken}` },
    });
    await devopsHandler(req, res);
    expect(res._getStatusCode()).toBe(403);
    assertNoBusinessLogic();
  });

  test('devops endpoint prevents privilege escalation via tampered JWT role', async () => {
      mockedPrisma.session.findFirst.mockResolvedValue({
          id: 'sess-1',
          userId: testUser.id,
          user: { ...testUser, role: 'user' } // DB says user
      } as any);

      const tamperedToken = jwt.sign(
          { user: { ...testUser, role: 'admin' }, sessionId: 'sess-1' },
          process.env.JWT_SECRET!
      );

      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `Bearer ${tamperedToken}` },
      });
      await devopsHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
      assertNoBusinessLogic();
    });

    test('devops endpoint allows admin access with various role casings', async () => {
        const roles = ['admin', 'ADMIN', 'Admin'];
        for (const role of roles) {
            mockedPrisma.session.findFirst.mockResolvedValue({
                id: 'sess-admin',
                userId: adminUser.id,
                user: { ...adminUser, role }
            } as any);
            mockedPrisma.devOpsMetric.findMany.mockResolvedValue([]);

            const adminToken = jwt.sign({ user: adminUser, sessionId: 'sess-admin' }, process.env.JWT_SECRET!);
            const { req, res } = createMocks({
              method: 'GET',
              headers: { authorization: `Bearer ${adminToken}` },
            });
            await devopsHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
        }
      });

    test('rejects alg: none attack', async () => {
        // Many JWT libraries reject 'none' by default if a secret is provided for verification.
        // Constructing a 'none' algorithm token manually: header.payload.
        const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64').replace(/=/g, '');
        const payload = Buffer.from(JSON.stringify({ user: testUser, sessionId: 'sess-1' })).toString('base64').replace(/=/g, '');
        const noneToken = `${header}.${payload}.`;

        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${noneToken}` },
        });
        await meHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
        assertNoBusinessLogic();
    });
});
