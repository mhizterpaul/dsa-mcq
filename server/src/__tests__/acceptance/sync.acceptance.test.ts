process.env.JWT_SECRET = 'test-secret';
import { createMocks, RequestMethod, Body } from 'node-mocks-http';
import registerHandler from '../../pages/api/auth/register';
import syncHandler from '../../pages/api/sync';
import { prisma } from '../../infra/prisma/client';
import { generateSignature } from '../../utils/signature';

const testUser = {
  email: 'sync-qa@example.com',
  password: 'password123',
  name: 'syncuser',
};

const otherUser = {
    email: 'other-sync@example.com',
    password: 'password123',
    name: 'otheruser',
};

describe('Sync Acceptance Tests (QA Rigorous)', () => {
  let token: string;
  let syncKey: string;
  let userId: string;
  const fixedNow = new Date('2026-01-01T12:00:00Z');

  beforeAll(async () => {
    try {
        await prisma.session.deleteMany();
        await prisma.engagement.deleteMany();
        await prisma.learningSession.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();

        const { req, res } = createMocks({
          method: 'POST',
          body: testUser,
        });
        await registerHandler(req, res);
        const data = JSON.parse(res._getData());
        token = data.token;
        syncKey = data.syncKey;
        userId = data.user.id;
    } catch (e) {
        console.error('Setup failed:', e);
        throw e;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Method Enforcement', () => {
      test.each(['GET', 'PUT', 'DELETE'])('Rejects %s method', async (method) => {
          const { req, res } = createMocks({ method: method as RequestMethod, headers: { authorization: `Bearer ${token}` } });
          await syncHandler(req as any, res as any);
          expect(res._getStatusCode()).toBe(405);
      });
  });

  describe('Authentication & Security', () => {
      /**
       * @Doc("Endpoints must reject unauthorized access")
       * @Route("/api/sync")
       */
      test('401 if missing token', async () => {
          const { req, res } = createMocks({ method: 'POST' });
          await syncHandler(req as any, res as any);
          expect(res._getStatusCode()).toBe(401);
      });

      test('401 if invalid token', async () => {
          const { req, res } = createMocks({ method: 'POST', headers: { authorization: 'Bearer invalid' } });
          await syncHandler(req as any, res as any);
          expect(res._getStatusCode()).toBe(401);
      });

      test('403 if missing signature', async () => {
          const { req, res } = createMocks({
              method: 'POST',
              headers: { authorization: `Bearer ${token}` },
              body: { learning_sessions: [] }
          });
          await syncHandler(req as any, res as any);
          expect(res._getStatusCode()).toBe(403);
      });

      /**
       * @Doc("Rejects tampered payloads using HMAC signature verification")
       * @Route("/api/sync")
       */
      test('403 if invalid signature (tampering)', async () => {
          const body = { learning_sessions: [{ id: 'ls1', startTime: fixedNow }] };
          const signature = generateSignature(body, syncKey);

          const tamperedBody = { learning_sessions: [{ id: 'ls1', startTime: new Date('2026-01-01T13:00:00Z') }] };

          const { req, res } = createMocks({
              method: 'POST',
              headers: {
                  authorization: `Bearer ${token}`,
                  'x-client-signature': signature
              },
              body: tamperedBody
          });
          await syncHandler(req as any, res as any);
          expect(res._getStatusCode()).toBe(403);
      });
  });

  describe('Payload Validation', () => {
      test('400 if payload is not an object', async () => {
          const body = "not an object";
          const signature = generateSignature(body, syncKey);
          const { req, res } = createMocks({
              method: 'POST',
              headers: { authorization: `Bearer ${token}`, 'x-client-signature': signature },
              body: body as any as Body
          });
          await syncHandler(req as any, res as any);
          expect(res._getStatusCode()).toBe(400);
      });

      test('400 if table is not an array', async () => {
          const body = { learning_sessions: "not an array" };
          const signature = generateSignature(body, syncKey);
          const { req, res } = createMocks({
              method: 'POST',
              headers: { authorization: `Bearer ${token}`, 'x-client-signature': signature },
              body: body
          });
          await syncHandler(req as any, res as any);
          expect(res._getStatusCode()).toBe(400);
      });

      test('400 if invalid date format', async () => {
          const body = { learning_sessions: [{ id: 'ls1', startTime: "invalid-date" }] };
          const signature = generateSignature(body, syncKey);
          const { req, res } = createMocks({
              method: 'POST',
              headers: { authorization: `Bearer ${token}`, 'x-client-signature': signature },
              body: body
          });
          await syncHandler(req as any, res as any);
          expect(res._getStatusCode()).toBe(400);
      });
  });

  describe('Isolation & Data Integrity', () => {
      test('Strict userId isolation: Cannot sync data for another user', async () => {
          // Register another user
          const { res: otherRes } = createMocks({ method: 'POST', body: otherUser });
          await registerHandler(createMocks({ method: 'POST', body: otherUser }).req, otherRes);
          const otherUserId = JSON.parse(otherRes._getData()).user.id;

          const body = {
              learning_sessions: [
                  { id: 'ls-other', userId: otherUserId, startTime: fixedNow, updatedAt: fixedNow }
              ]
          };
          const signature = generateSignature(body, syncKey);
          const { req, res } = createMocks({
              method: 'POST',
              headers: { authorization: `Bearer ${token}`, 'x-client-signature': signature },
              body: body
          });
          await syncHandler(req as any, res as any);
          expect(res._getStatusCode()).toBe(200);

          // Verify it was NOT created for the other user or the current user
          const sessionInDb = await prisma.learningSession.findUnique({ where: { id: 'ls-other' } });
          expect(sessionInDb).toBeNull();
      });

      test('Regular users cannot modify global categories', async () => {
          const catId = `cat-global-${Math.random()}`;
          const cat = await prisma.category.create({ data: { id: catId, name: `Global Cat ${catId}` } });

          const body = {
              categories: [
                  { id: cat.id, name: 'Hacked Cat', updatedAt: new Date(Date.now() + 100000).toISOString() }
              ]
          };
          const signature = generateSignature(body, syncKey);
          const { req, res } = createMocks({
              method: 'POST',
              headers: { authorization: `Bearer ${token}`, 'x-client-signature': signature },
              body: body
          });
          await syncHandler(req as any, res as any);
          expect(res._getStatusCode()).toBe(200);

          const catAfter = await prisma.category.findUnique({ where: { id: cat.id } });
          expect(catAfter?.name).toBe(`Global Cat ${catId}`);
      });
  });

  describe('Conflict Resolution (Deterministic)', () => {
      /**
       * @Doc("Implements Last-Write-Wins (LWW) conflict resolution")
       * @Route("/api/sync")
       */
      test('Server wins when client is outdated', async () => {
          const futureDate = new Date(fixedNow.getTime() + 1000);
          const pastDate = fixedNow;
          const lsId = `ls-conf-1-${Math.random()}`;

          await prisma.learningSession.create({
              data: { id: lsId, userId, startTime: fixedNow, updatedAt: futureDate }
          });

          const body = {
              learning_sessions: [
                  { id: lsId, startTime: fixedNow, updatedAt: pastDate.toISOString() }
              ]
          };
          const signature = generateSignature(body, syncKey);
          const { req, res } = createMocks({
              method: 'POST',
              headers: { authorization: `Bearer ${token}`, 'x-client-signature': signature },
              body: body
          });
          await syncHandler(req as any, res as any);

          const result = JSON.parse(res._getData());
          const ls = result.learning_sessions.find((s: any) => s.id === lsId);
          expect(new Date(ls.updatedAt).toISOString()).toBe(futureDate.toISOString());
      });

      test('Client wins when client is newer', async () => {
          const futureDate = new Date(fixedNow.getTime() + 1000);
          const pastDate = fixedNow;
          const lsId = `ls-conf-2-${Math.random()}`;

          await prisma.learningSession.create({
              data: { id: lsId, userId, startTime: fixedNow, updatedAt: pastDate }
          });

          const body = {
              learning_sessions: [
                  { id: lsId, startTime: fixedNow, updatedAt: futureDate.toISOString() }
              ]
          };
          const signature = generateSignature(body, syncKey);
          const { req, res } = createMocks({
              method: 'POST',
              headers: { authorization: `Bearer ${token}`, 'x-client-signature': signature },
              body: body
          });
          await syncHandler(req as any, res as any);

          const result = JSON.parse(res._getData());
          const ls = result.learning_sessions.find((s: any) => s.id === lsId);
          expect(new Date(ls.updatedAt).toISOString()).toBe(futureDate.toISOString());
      });
  });

  describe('Batch Sync & Concurrency', () => {
      test('Batch sync multiple records and tables', async () => {
          const body = {
              learning_sessions: [
                  { id: `batch-ls-1-${Math.random()}`, startTime: fixedNow, updatedAt: fixedNow },
                  { id: `batch-ls-2-${Math.random()}`, startTime: fixedNow, updatedAt: fixedNow }
              ],
              user_engagement: [
                  { userId, xp: 100, updatedAt: fixedNow }
              ]
          };
          const signature = generateSignature(body, syncKey);
          const { req, res } = createMocks({
              method: 'POST',
              headers: { authorization: `Bearer ${token}`, 'x-client-signature': signature },
              body: body
          });
          await syncHandler(req as any, res as any);

          expect(res._getStatusCode()).toBe(200);
          const result = JSON.parse(res._getData());
          expect(result.learning_sessions.length).toBeGreaterThanOrEqual(2);
          expect(result.user_engagement.length).toBeGreaterThanOrEqual(1);
      });

      test('Enforces write lock with 409 Conflict', async () => {
          // Simulate user is already syncing
          await prisma.user.update({ where: { id: userId }, data: { isSyncing: true } });

          const body = { learning_sessions: [] };
          const signature = generateSignature(body, syncKey);
          const { req, res } = createMocks({
              method: 'POST',
              headers: { authorization: `Bearer ${token}`, 'x-client-signature': signature },
              body: body
          });
          await syncHandler(req as any, res as any);

          expect(res._getStatusCode()).toBe(409);
          expect(JSON.parse(res._getData()).message).toContain('Sync already in progress');

          // Reset for subsequent tests
          await prisma.user.update({ where: { id: userId }, data: { isSyncing: false } });
      });
  });
});
