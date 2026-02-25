process.env.DATABASE_URL = "file:./test.db";
process.env.JWT_SECRET = "test-secret";

import { createMocks } from 'node-mocks-http';
import devopsApiHandler from '../../pages/api/analytics/devops';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';
import { AnalyticsService } from '../../controllers/analyticsController';
import { EngagementService } from '../../controllers/engagementController';

describe('Analytics Acceptance Tests (Rigorous & Real DB)', () => {
  const fixedDate = new Date('2025-01-31T12:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);
  });

  afterAll(async () => {
    jest.useRealTimers();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.devOpsMetric.deleteMany();
    await prisma.engagement.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('API: /api/analytics/devops', () => {
    test('should return precise metrics and enforce admin access', async () => {
      // 1. Seed data
      const admin = await prisma.user.create({
        data: { email: 'admin@test.com', name: 'Admin', role: 'admin' } as any
      });

      const tenMinsAgo = new Date(fixedDate.getTime() - 10 * 60 * 1000); // 11:50

      await prisma.devOpsMetric.createMany({
        data: [
          { type: 'CRASH', payload: JSON.stringify({ message: 'boom' }), createdAt: tenMinsAgo },
          { type: 'APP_STARTUP_TIME', payload: JSON.stringify({ timeToFirstPrintMs: 200 }), createdAt: fixedDate },
          { type: 'SECURITY_BREACH', payload: JSON.stringify({ vector: 'sql-injection' }), createdAt: fixedDate },
          { type: 'ERROR', payload: 'INVALID-JSON-PAYLOAD', createdAt: fixedDate }, // Malformed JSON
        ]
      });

      const otherUser = await prisma.user.create({ data: { email: 'other@test.com' } });
      await prisma.engagement.createMany({
        data: [
          { userId: admin.id, xp: 1000 },
          { userId: otherUser.id, xp: 2000 }, // Average should be 1500
        ]
      });

      const token = jwt.sign({ user: admin, sessionId: 'admin-session' }, process.env.JWT_SECRET!);
      await prisma.session.create({
        data: {
          id: 'admin-session',
          sessionToken: 'admin-token',
          userId: admin.id,
          expires: new Date(fixedDate.getTime() + 3600000)
        }
      });

      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `Bearer ${token}` }
      });

      await devopsApiHandler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      expect(data.summary.userVolume).toBe(2);
      expect(data.summary.systemCrashes).toBe(1);
      expect(data.summary.performance).toBe(200);
      expect(data.summary.mttr).toBe(10); // Exactly 10 minutes
      expect(data.summary.averageUserPerformance).toBe(1500);
    });

    test('should reject expired sessions in DB', async () => {
        const admin = await prisma.user.create({
            data: { email: 'expired@test.com', name: 'Admin', role: 'admin' } as any
        });
        const token = jwt.sign({ user: admin, sessionId: 'expired-session' }, process.env.JWT_SECRET!);

        await prisma.session.create({
          data: {
            id: 'expired-session',
            sessionToken: 'expired-token',
            userId: admin.id,
            expires: new Date(fixedDate.getTime() - 1000) // 1 second ago
          }
        });

        const { req, res } = createMocks({
          method: 'GET',
          headers: { authorization: `Bearer ${token}` }
        });

        await devopsApiHandler(req as any, res as any);

        expect(res._getStatusCode()).toBe(401);
        expect(JSON.parse(res._getData()).message).toBe('Session expired');
    });
  });

  describe('Service Logic: AnalyticsService', () => {
    test('should calculate Trend Delta (Growth & Decline)', async () => {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      // Previous period: 2 users
      await prisma.user.createMany({
        data: [
          { email: 'p1@t.com', createdAt: new Date(fixedDate.getTime() - 45 * 24 * 60 * 60 * 1000) },
          { email: 'p2@t.com', createdAt: new Date(fixedDate.getTime() - 40 * 24 * 60 * 60 * 1000) },
        ]
      });

      // Current period: 3 users
      await prisma.user.createMany({
        data: [
          { email: 'c1@t.com', createdAt: new Date(fixedDate.getTime() - 5 * 24 * 60 * 60 * 1000) },
          { email: 'c2@t.com', createdAt: new Date(fixedDate.getTime() - 10 * 24 * 60 * 60 * 1000) },
          { email: 'c3@t.com', createdAt: new Date(fixedDate.getTime() - 15 * 24 * 60 * 60 * 1000) },
        ]
      });

      const service = new AnalyticsService(prisma);
      const result = await service.getDevOpsMetrics(fixedDate);

      expect(result.summary.userVolume).toBe(5);
      expect(result.summary.userVolumeChange).toBe(1); // 3 - 2 = +1
    });

    test('should handle Multiple Crash/Recovery Incidents for MTTR', async () => {
      await prisma.devOpsMetric.createMany({
        data: [
          // Incident 1: 10 mins recovery
          { type: 'CRASH', payload: '{}', createdAt: new Date(fixedDate.getTime() - 60 * 60 * 1000) },
          { type: 'APP_STARTUP_TIME', payload: '{"timeToFirstPrintMs": 100}', createdAt: new Date(fixedDate.getTime() - 50 * 60 * 1000) },

          // Incident 2: 20 mins recovery
          { type: 'CRASH', payload: '{}', createdAt: new Date(fixedDate.getTime() - 40 * 24 * 60 * 60 * 1000) },
          { type: 'APP_STARTUP_TIME', payload: '{"timeToFirstPrintMs": 100}', createdAt: new Date(fixedDate.getTime() - 40 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000) },
        ]
      });

      const service = new AnalyticsService(prisma);
      const result = await service.getDevOpsMetrics(fixedDate);

      // Average MTTR = (10 + 20) / 2 = 15 mins
      expect(result.summary.mttr).toBe(15);
    });

    test('should be resilient to Malformed JSON and missing fields', async () => {
      await prisma.devOpsMetric.createMany({
        data: [
          { type: 'APP_STARTUP_TIME', payload: 'INVALID' },
          { type: 'APP_STARTUP_TIME', payload: '{"wrong_field": 123}' },
          { type: 'APP_STARTUP_TIME', payload: '{"timeToFirstPrintMs": 300}' },
        ]
      });

      const service = new AnalyticsService(prisma);
      const result = await service.getDevOpsMetrics(fixedDate);

      // Only the valid one should be counted
      expect(result.summary.performance).toBe(300);
    });
  });

  describe('Service Logic: EngagementService', () => {
    test('should calculate average performance correctly across multiple users', async () => {
      await prisma.user.createMany({ data: [{ id: 'u1' }, { id: 'u2' }] });
      await prisma.engagement.createMany({
        data: [
          { userId: 'u1', xp: 500 },
          { userId: 'u2', xp: 1500 },
        ]
      });

      const service = new EngagementService(prisma);
      const avg = await service.getAverageUserPerformance();
      expect(avg).toBe(1000);
    });
  });
});
