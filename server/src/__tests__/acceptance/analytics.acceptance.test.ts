process.env.DATABASE_URL = "file:./test.db";
process.env.JWT_SECRET = "test-secret";
import { createMocks } from 'node-mocks-http';
import devopsApiHandler, { devopsHandler } from '../../pages/api/analytics/devops';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';
import { AnalyticsService } from '../../controllers/analyticsController';
import { EngagementService } from '../../controllers/engagementController';

describe('Analytics Acceptance Tests (Real DB)', () => {
  beforeEach(async () => {
    // Reset DB between tests
    await prisma.devOpsMetric.deleteMany();
    await prisma.engagement.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('API: /api/analytics/devops', () => {
    test('should return exact aggregated metrics for admin', async () => {
      // 1. Seed data
      const admin = await prisma.user.create({
        data: { email: 'admin@test.com', name: 'Admin', role: 'admin' } as any
      });

      const now = new Date('2025-01-01T12:00:00Z');
      const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000); // 11:50

      await prisma.devOpsMetric.createMany({
        data: [
          { type: 'CRASH', payload: JSON.stringify({ message: 'boom' }), createdAt: tenMinsAgo },
          { type: 'APP_STARTUP_TIME', payload: JSON.stringify({ timeToFirstPrintMs: 200 }), createdAt: now },
          { type: 'SECURITY_BREACH', payload: JSON.stringify({ vector: 'sql-injection' }), createdAt: now },
        ]
      });

      await prisma.engagement.create({
        data: { userId: admin.id, xp: 1000 }
      });

      // 2. Call handler
      // 2. Call handler with real JWT to test withAdmin
      const token = jwt.sign({ user: admin, sessionId: 'fake-session' }, process.env.JWT_SECRET!);

      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `Bearer ${token}` }
      });

      // We need to mock session because withAuth checks it in DB
      await prisma.session.create({
        data: {
            id: 'fake-session',
            sessionToken: 'fake-token',
            userId: admin.id,
            expires: new Date(Date.now() + 3600000)
        }
      });

      await devopsApiHandler(req as any, res as any);

      // 3. Assertions
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      expect(data.summary.userVolume).toBe(1);
      expect(data.summary.systemCrashes).toBe(1);
      expect(data.summary.performance).toBe(200);
      expect(data.summary.securityAnomalies).toBe(1);
      expect(data.summary.averageUserPerformance).toBe(1000);
      expect(data.summary.mttr).toBe(10); // Exactly 10 minutes
    });

    test('should deny access to non-admins', async () => {
      const user = await prisma.user.create({
        data: { email: 'user@test.com', name: 'User', role: 'USER' } as any
      });
      const token = jwt.sign({ user, sessionId: 'user-session' }, process.env.JWT_SECRET!);

      await prisma.session.create({
        data: {
            id: 'user-session',
            sessionToken: 'user-token',
            userId: user.id,
            expires: new Date(Date.now() + 3600000)
        }
      });

      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `Bearer ${token}` }
      });

      await devopsApiHandler(req as any, res as any);

      expect(res._getStatusCode()).toBe(403);
    });
  });

  describe('Trend and Aggregation Logic', () => {
    test('should calculate User Volume Change (Trend)', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const oldUser = await prisma.user.create({ data: { email: 'old@test.com', createdAt: yesterday } });
      const newUser = await prisma.user.create({ data: { email: 'new@test.com' } });

      await prisma.engagement.createMany({
        data: [
          { userId: oldUser.id, createdAt: yesterday },
          { userId: newUser.id, createdAt: new Date() }
        ]
      });

      const service = new AnalyticsService(prisma);
      const result = await service.getDevOpsMetrics();

      expect(result.summary.userVolume).toBe(2);
      expect(result.summary.userVolumeChange).toBe(2); // Both created within 30 days
    });

    test('should calculate exact Availability', async () => {
        const start = new Date('2025-01-01T10:00:00Z');
        const end = new Date('2025-01-01T11:00:00Z'); // 60 mins total

        await prisma.devOpsMetric.createMany({
          data: [
            { type: 'START', payload: '{}', createdAt: start },
            { type: 'CRASH', payload: '{}', createdAt: new Date('2025-01-01T10:30:00Z') },
            { type: 'END', payload: '{}', createdAt: end },
          ]
        });

        const service = new AnalyticsService(prisma);
        const result = await service.getDevOpsMetrics();

        // 1 crash = 15 mins assumed downtime.
        // 60 mins total range.
        // 15/60 = 25% downtime. 75% availability.
        expect(result.summary.availability).toBe(75);
    });
  });
});
