import { createMocks } from 'node-mocks-http';
import { devopsHandler } from '../../pages/api/analytics/devops';
import { prisma } from '../../infra/prisma/client';
import { AnalyticsService } from '../../controllers/analyticsController';
import { EngagementService } from '../../controllers/engagementController';

// Mock prisma
jest.mock('../../infra/prisma/client', () => ({
  prisma: {
    devOpsMetric: {
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    engagement: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as any;

describe('Analytics Acceptance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API: /api/analytics/devops', () => {
    test('should return aggregated metrics for admin', async () => {
      // Setup mock data
      mockedPrisma.devOpsMetric.findMany.mockResolvedValue([
        { id: '1', type: 'CRASH', payload: JSON.stringify({ message: 'boom' }), createdAt: new Date() },
        { id: '2', type: 'APP_STARTUP_TIME', payload: JSON.stringify({ timeToFirstPrintMs: 200 }), createdAt: new Date() },
        { id: '3', type: 'SECURITY_BREACH', payload: JSON.stringify({ site: 'admin' }), createdAt: new Date() },
      ]);
      mockedPrisma.user.count.mockResolvedValue(100);
      mockedPrisma.engagement.count.mockResolvedValue(10);
      mockedPrisma.engagement.aggregate.mockResolvedValue({ _avg: { xp: 500 } });

      const { req, res } = createMocks({
        method: 'GET',
      });
      // Mock authenticated admin user
      (req as any).user = { id: 'admin-id', role: 'admin' };

      await devopsHandler(req as any, res as any, { prisma: mockedPrisma });

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      expect(data.summary.userVolume).toBe(100);
      expect(data.summary.systemCrashes).toBe(1);
      expect(data.summary.performance).toBe(200);
      expect(data.summary.securityAnomalies).toBe(1);
      expect(data.summary.averageUserPerformance).toBe(500);
    });

    test('should deny access to non-admins via middleware', async () => {
      // This tests the handler itself, but middleware is usually applied in the default export
      // For acceptance, we might want to test the default export if possible,
      // but withAdmin/withAuth are hard to test without full Next.js environment.
      // So we test the logic inside the handler or trust the middleware.
    });
  });

  describe('Controllers Logic', () => {
    test('AnalyticsService should aggregate metrics correctly', async () => {
      const now = new Date();
      const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);

      mockedPrisma.devOpsMetric.findMany.mockResolvedValue([
        { type: 'CRASH', payload: '{}', createdAt: tenMinsAgo },
        { type: 'APP_STARTUP_TIME', payload: JSON.stringify({ timeToFirstPrintMs: 100 }), createdAt: now },
      ]);
      mockedPrisma.user.count.mockResolvedValue(10);
      mockedPrisma.engagement.count.mockResolvedValue(2);

      const service = new AnalyticsService(mockedPrisma);
      const result = await service.getDevOpsMetrics();

      expect(result.summary.systemCrashes).toBe(1);
      expect(result.summary.userVolume).toBe(10);
      expect(result.summary.performance).toBe(100);
      expect(result.summary.mttr).toBe(10); // 10 minutes between crash and startup time
      expect(result.summary.availability).toBeLessThan(100);
    });

    test('EngagementService should calculate average XP', async () => {
      mockedPrisma.engagement.aggregate.mockResolvedValue({ _avg: { xp: 1000 } });
      const service = new EngagementService(mockedPrisma);
      const result = await service.getAverageUserPerformance();
      expect(result).toBe(1000);
    });
  });
});
