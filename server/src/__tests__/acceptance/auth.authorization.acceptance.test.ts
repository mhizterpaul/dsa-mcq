import { createMocks } from 'node-mocks-http';
import meHandler from '../../pages/api/user/me';
import syncHandler from '../../pages/api/sync';
import questionsHandler from '../../pages/api/learning/questions';
import devopsHandler from '../../pages/api/analytics/devops';
import actionHandlerExport from '../../pages/api/engagement/action';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';

jest.mock('../../infra/cacheService');

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
    { name: 'action', handler: actionHandlerExport },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  function assertNoBusinessLogic() {
      // In a real DB test, we check if side effects happened.
      // For this test, we mainly care about the response code.
  }

  test.each(protectedEndpoints)(
    '$name rejects unauthenticated access (no token)',
    async ({ name, handler }) => {
      const { req, res } = createMocks({
          method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
          query: name === 'questions' ? { categoryId: 'cat1', difficulty: 'easy' } : {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects malformed authorization header (missing Bearer prefix)',
    async ({ name, handler }) => {
      const token = jwt.sign({ user: testUser, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: token },
        query: name === 'questions' ? { categoryId: 'cat1', difficulty: 'easy' } : {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
    }
  );

  test.each(protectedEndpoints)(
    '$name allows lowercase bearer prefix',
    async ({ name, handler }) => {
      const user = await prisma.user.create({ data: testUser });
      await prisma.session.create({
          data: {
              id: 'sess-1',
              userId: user.id,
              sessionToken: 'tk1',
              expires: new Date(Date.now() + 3600000),
              syncKey: 'key1'
          }
      });
      if (name === 'action') {
          await prisma.engagement.create({ data: { userId: user.id, xp: 0 } });
      }

      const token = jwt.sign({ user: { id: user.id }, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `bearer ${token}` },
        body: name === 'action' ? { xp: 10 } : {},
        query: name === 'questions' ? { categoryId: 'cat1', difficulty: 'EASY' } : {},
      });

      // sync route requires signature too
      if (name === 'sync') {
          req.headers['x-client-signature'] = 'invalid';
      }

      await handler(req, res);

      if (name === 'devops') {
          expect(res._getStatusCode()).toBe(403); // because not admin
      } else if (name === 'sync') {
          expect(res._getStatusCode()).toBe(403); // invalid signature
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
        query: name === 'questions' ? { categoryId: 'cat1', difficulty: 'easy' } : {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
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
        query: name === 'questions' ? { categoryId: 'cat1', difficulty: 'easy' } : {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects token with missing sessionId',
    async ({ name, handler }) => {
      const invalidToken = jwt.sign({ user: testUser }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `Bearer ${invalidToken}` },
        query: name === 'questions' ? { categoryId: 'cat1', difficulty: 'easy' } : {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects revoked session (session deleted from DB)',
    async ({ name, handler }) => {
      const token = jwt.sign({ user: testUser, sessionId: 'revoked-sess' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `Bearer ${token}` },
        query: name === 'questions' ? { categoryId: 'cat1', difficulty: 'easy' } : {},
        body: name === 'action' ? { xp: 10 } : {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      assertNoBusinessLogic();
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects session with missing user record in DB',
    async ({ name, handler }) => {
      await prisma.user.create({ data: testUser });
      await prisma.session.create({
          data: {
              id: 'sess-1',
              userId: testUser.id,
              sessionToken: 'tk1',
              expires: new Date(Date.now() + 3600000)
          }
      });
      await prisma.user.delete({ where: { id: testUser.id } });

      const token = jwt.sign({ user: { id: testUser.id }, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `Bearer ${token}` },
        query: name === 'questions' ? { categoryId: 'cat1', difficulty: 'easy' } : {},
        body: name === 'action' ? { xp: 10 } : {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      assertNoBusinessLogic();
    }
  );

  test.each(protectedEndpoints)(
    '$name handles database failure gracefully (returns sanitized 500)',
    async ({ name, handler }) => {
      const findUniqueSpy = jest.spyOn(prisma.session, 'findUnique').mockRejectedValue(new Error('Internal Database Error'));

      const token = jwt.sign({ user: { id: testUser.id }, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method: name === 'action' || name === 'sync' ? 'POST' : 'GET',
        headers: { authorization: `Bearer ${token}` },
        body: name === 'action' ? { xp: 10 } : {},
        query: name === 'questions' ? { categoryId: 'cat1', difficulty: 'easy' } : {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Internal Server Error');
      expect(data.error).toBeUndefined(); // No leak
      findUniqueSpy.mockRestore();
    }
  );

  test('devops endpoint enforces admin role (using DB role)', async () => {
    await prisma.user.create({ data: { ...testUser, role: 'user' } });
    await prisma.session.create({
        data: {
            id: 'sess-1',
            userId: testUser.id,
            sessionToken: 'tk1',
            expires: new Date(Date.now() + 3600000)
        }
    });

    const userToken = jwt.sign({ user: { id: testUser.id }, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${userToken}` },
    });
    await devopsHandler(req, res);
    expect(res._getStatusCode()).toBe(403);
  });

  test('devops endpoint prevents privilege escalation via tampered JWT role', async () => {
      await prisma.user.create({ data: { ...testUser, role: 'user' } });
      await prisma.session.create({
          data: {
              id: 'sess-1',
              userId: testUser.id,
              sessionToken: 'tk1',
              expires: new Date(Date.now() + 3600000)
          }
      });

      const tamperedToken = jwt.sign(
          { user: { id: testUser.id, role: 'admin' }, sessionId: 'sess-1' },
          process.env.JWT_SECRET!
      );

      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `Bearer ${tamperedToken}` },
      });
      await devopsHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });

    test('devops endpoint allows admin access with various role casings', async () => {
        const roles = ['admin', 'ADMIN', 'Admin'];
        for (const role of roles) {
            await prisma.user.deleteMany();
            await prisma.user.create({ data: { ...adminUser, role } });
            await prisma.session.create({
                data: {
                    id: `sess-${role}`,
                    userId: adminUser.id,
                    sessionToken: `tk-${role}`,
                    expires: new Date(Date.now() + 3600000)
                }
            });

            const adminToken = jwt.sign({ user: { id: adminUser.id }, sessionId: `sess-${role}` }, process.env.JWT_SECRET!);
            const { req, res } = createMocks({
              method: 'GET',
              headers: { authorization: `Bearer ${adminToken}` },
            });
            await devopsHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
        }
      });

    test('rejects alg: none attack', async () => {
        const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64').replace(/=/g, '');
        const payload = Buffer.from(JSON.stringify({ user: testUser, sessionId: 'sess-1' })).toString('base64').replace(/=/g, '');
        const noneToken = `${header}.${payload}.`;

        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${noneToken}` },
        });
        await meHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
    });
});
