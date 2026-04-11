import { createMocks, RequestMethod } from 'node-mocks-http';
import meHandler from '../../pages/api/user/me';
import syncHandler from '../../pages/api/sync';
import questionsHandler from '../../pages/api/learning/questions';
import devopsHandler from '../../pages/api/analytics/devops';
import actionHandlerExport from '../../pages/api/engagement/action';
import { prisma } from '../../infra/prisma/client';
import * as authUtils from '../../utils/auth';
import jwt from 'jsonwebtoken';

jest.mock('../../infra/cacheService');

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
    role: 'ADMIN',
};

process.env.JWT_SECRET = 'test-secret';

describe('Cross-Endpoint Authorization Enforcement', () => {
  const protectedEndpoints = [
    { name: 'me', handler: meHandler, method: 'GET' as RequestMethod },
    { name: 'sync', handler: syncHandler, method: 'POST' as RequestMethod },
    { name: 'questions', handler: questionsHandler, method: 'GET' as RequestMethod, query: { categoryId: 'cat1', difficulty: 'easy' } },
    { name: 'devops', handler: devopsHandler, method: 'GET' as RequestMethod },
    { name: 'action', handler: actionHandlerExport, method: 'POST' as RequestMethod, body: { xp: 10 } },
  ];

  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.engagement.deleteMany();
    await prisma.devOpsMetric.deleteMany();
    await prisma.learningSession.deleteMany();
  });

  afterEach(() => {
      jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function assertNoSideEffects(name: string) {
      if (name === 'action') {
          expect(await prisma.engagement.count()).toBe(0);
      } else if (name === 'sync') {
          expect(await prisma.learningSession.count()).toBe(0);
      } else if (name === 'devops') {
          expect(await prisma.devOpsMetric.count()).toBe(0);
      }
  }

  test.each(protectedEndpoints)(
    '$name rejects unauthenticated access (no token)',
    async ({ name, handler, method, query }) => {
      const { req, res } = createMocks({
          method,
          query: query || {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      await assertNoSideEffects(name);
    }
  );

  test.each(protectedEndpoints)(
    '$name rejects malformed authorization header',
    async ({ name, handler, method, query }) => {
      const token = jwt.sign({ user: { id: testUser.id }, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method,
        headers: { authorization: token },
        query: query || {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(401);
      await assertNoSideEffects(name);
    }
  );

  test.each(protectedEndpoints)(
    '$name allows lowercase bearer prefix',
    async ({ name, handler, method, query, body }) => {
      const user = await prisma.user.create({ data: testUser });
      const session = await prisma.session.create({
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

      const token = jwt.sign({ user: { id: user.id }, sessionId: session.id }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method,
        headers: {
            authorization: `bearer ${token}`,
            'x-client-signature': name === 'sync' ? 'dummy' : undefined
        },
        body: body || {},
        query: query || {},
      });

      await handler(req, res);

      if (name === 'devops') {
          expect(res._getStatusCode()).toBe(403);
      } else if (name === 'sync') {
          expect(res._getStatusCode()).toBe(403);
      } else {
          expect(res._getStatusCode()).toBe(200);
      }
    }
  );

  test.each(protectedEndpoints)(
    '$name handles database failure gracefully (returns sanitized 500)',
    async ({ name, handler, method, query, body }) => {
      // Mock prisma instead
      jest.spyOn(prisma.session, 'findUnique').mockRejectedValue(new Error('Internal Database Error'));

      const token = jwt.sign({ user: { id: testUser.id }, sessionId: 'sess-1' }, process.env.JWT_SECRET!);
      const { req, res } = createMocks({
        method,
        headers: { authorization: `Bearer ${token}` },
        body: body || {},
        query: query || {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(500);
      const resData = JSON.parse(res._getData());
      expect(resData.message).toBe('Internal Server Error');
      expect(resData.error).toBeUndefined();
      await assertNoSideEffects(name);
    }
  );

  test('devops endpoint enforces admin role (using DB role)', async () => {
    const user = await prisma.user.create({ data: { ...testUser, role: 'USER' } });
    const session = await prisma.session.create({
        data: {
            id: 'sess-user',
            userId: user.id,
            sessionToken: 'tk1',
            expires: new Date(Date.now() + 3600000)
        }
    });

    const userToken = jwt.sign({ user: { id: user.id }, sessionId: session.id }, process.env.JWT_SECRET!);
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: `Bearer ${userToken}` },
    });
    await devopsHandler(req, res);
    expect(res._getStatusCode()).toBe(403);
    await assertNoSideEffects('devops');
  });

  test('devops endpoint prevents privilege escalation via tampered JWT role', async () => {
      const user = await prisma.user.create({ data: { ...testUser, role: 'USER' } });
      const session = await prisma.session.create({
          data: {
              id: 'sess-user-2',
              userId: user.id,
              sessionToken: 'tk2',
              expires: new Date(Date.now() + 3600000)
          }
      });

      const tamperedToken = jwt.sign(
          { user: { id: user.id }, role: 'ADMIN', sessionId: session.id },
          process.env.JWT_SECRET!
      );

      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `Bearer ${tamperedToken}` },
      });
      await devopsHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
      await assertNoSideEffects('devops');
    });

    test('devops endpoint allows admin access with various role casings', async () => {
        const roles = ['admin', 'ADMIN', 'Admin'];
        for (const role of roles) {
            const user = await prisma.user.create({
                data: { ...adminUser, id: `admin-${role}`, email: `admin-${role}@x.com`, role }
            });
            const session = await prisma.session.create({
                data: {
                    id: `sess-${role}`,
                    userId: user.id,
                    sessionToken: `tk-${role}`,
                    expires: new Date(Date.now() + 3600000)
                }
            });

            const adminToken = jwt.sign({ user: { id: user.id }, sessionId: session.id }, process.env.JWT_SECRET!);
            const { req, res } = createMocks({
              method: 'GET',
              headers: { authorization: `Bearer ${adminToken}` },
            });
            await devopsHandler(req, res);
            expect(res._getStatusCode()).toBe(200);
        }
      });
});
