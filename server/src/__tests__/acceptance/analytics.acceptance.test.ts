process.env.JWT_SECRET = "test-secret";

import { createMocks } from 'node-mocks-http';
import devopsApiHandler from '../../pages/api/analytics/devops';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';
import { AnalyticsService } from '../../controllers/analyticsController';
import { EngagementService } from '../../controllers/engagementController';

describe('Analytics Acceptance Tests (Rigorous & Real DB)', () => {
  const fixedDate = new Date('2025-01-31T12:00:00Z');

  afterAll(async () => {
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
        data: { email: 'admin@test.com', name: 'Admin', role: 'admin' }
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

      // Use minimal token payload (adversarial check)
      const token = jwt.sign({ user: { id: admin.id }, sessionId: 'admin-session' }, process.env.JWT_SECRET!);

      await prisma.session.create({
        data: {
          id: 'admin-session',
          sessionToken: 'admin-token',
          userId: admin.id,
          expires: new Date(Date.now() + 3600000)
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
            data: { email: 'expired@test.com', name: 'Admin', role: 'admin' }
        });
        const token = jwt.sign({ user: { id: admin.id }, sessionId: 'expired-session' }, process.env.JWT_SECRET!);

        await prisma.session.create({
          data: {
            id: 'expired-session',
            sessionToken: 'expired-token',
            userId: admin.id,
            expires: new Date(Date.now() - 1000) // 1 second ago (REAL TIME)
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

    test('should reject adversarial token with wrong userId', async () => {
        const admin = await prisma.user.create({
            data: { email: 'admin2@test.com', role: 'admin' }
        });
        // Token claims to be admin, but userId in payload doesn't match session
        const token = jwt.sign({ user: { id: 'WRONG-ID' }, sessionId: 'admin-session-2' }, process.env.JWT_SECRET!);

        await prisma.session.create({
            data: {
              id: 'admin-session-2',
              sessionToken: 'tk-2',
              userId: admin.id,
              expires: new Date(Date.now() + 3600000)
            }
        });

        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` }
        });

        await devopsApiHandler(req as any, res as any);
        expect(res._getStatusCode()).toBe(401);
        expect(JSON.parse(res._getData()).message).toBe('Session not found or invalid');
    });
  });

  describe('Service Logic: AnalyticsService', () => {
    test('should calculate Trend Delta (Growth & Decline)', async () => {
      // Scenario 1: Growth (+1)
      await prisma.user.createMany({
        data: [
          // Previous period (Day -60 to Day -30): 2 users
          { email: 'p1@t.com', createdAt: new Date(fixedDate.getTime() - 45 * 24 * 60 * 60 * 1000) },
          { email: 'p2@t.com', createdAt: new Date(fixedDate.getTime() - 45 * 24 * 60 * 60 * 1000) },
          // Current period (Day -30 to Now): 3 users
          { email: 'c1@t.com', createdAt: new Date(fixedDate.getTime() - 5 * 24 * 60 * 60 * 1000) },
          { email: 'c2@t.com', createdAt: new Date(fixedDate.getTime() - 10 * 24 * 60 * 60 * 1000) },
          { email: 'c3@t.com', createdAt: new Date(fixedDate.getTime() - 15 * 24 * 60 * 60 * 1000) },
        ]
      });

      const service = new AnalyticsService(prisma);
      let result = await service.getDevOpsMetrics(fixedDate);
      expect(result.summary.userVolumeChange).toBe(1); // 3 - 2 = +1

      // Scenario 2: Decline
      await prisma.user.deleteMany();
      await prisma.user.createMany({
        data: [
          // Previous: 5
          { email: 'p1@t.com', createdAt: new Date(fixedDate.getTime() - 45 * 24 * 60 * 60 * 1000) },
          { email: 'p2@t.com', createdAt: new Date(fixedDate.getTime() - 45 * 24 * 60 * 60 * 1000) },
          { email: 'p3@t.com', createdAt: new Date(fixedDate.getTime() - 45 * 24 * 60 * 60 * 1000) },
          { email: 'p4@t.com', createdAt: new Date(fixedDate.getTime() - 45 * 24 * 60 * 60 * 1000) },
          { email: 'p5@t.com', createdAt: new Date(fixedDate.getTime() - 45 * 24 * 60 * 60 * 1000) },
          // Current: 2
          { email: 'c1@t.com', createdAt: new Date(fixedDate.getTime() - 5 * 24 * 60 * 60 * 1000) },
          { email: 'c2@t.com', createdAt: new Date(fixedDate.getTime() - 10 * 24 * 60 * 60 * 1000) },
        ]
      });
      result = await service.getDevOpsMetrics(fixedDate);
      expect(result.summary.userVolumeChange).toBe(-3); // 2 - 5 = -3
    });

    test('should handle Complex MTTR Scenarios (Back-to-back crashes)', async () => {
      await prisma.devOpsMetric.createMany({
        data: [
          // Incident 1: Double crash, then recovery 30 mins after first crash
          { type: 'CRASH', payload: '{}', createdAt: new Date(fixedDate.getTime() - 100 * 60 * 1000) },
          { type: 'CRASH', payload: '{}', createdAt: new Date(fixedDate.getTime() - 80 * 60 * 1000) },
          { type: 'APP_STARTUP_TIME', payload: '{"timeToFirstPrintMs": 100}', createdAt: new Date(fixedDate.getTime() - 70 * 60 * 1000) },

          // Incident 2: Single crash, 10 mins recovery
          { type: 'CRASH', payload: '{}', createdAt: new Date(fixedDate.getTime() - 40 * 60 * 1000) },
          { type: 'APP_STARTUP_TIME', payload: '{"timeToFirstPrintMs": 100}', createdAt: new Date(fixedDate.getTime() - 30 * 60 * 1000) },
        ]
      });

      const service = new AnalyticsService(prisma);
      const result = await service.getDevOpsMetrics(fixedDate);

      // Average MTTR:
      // Incident 1: 100 -> 70 = 30 mins (Second crash at 80 is ignored as it's during an active incident)
      // Incident 2: 40 -> 30 = 10 mins
      // Average = (30 + 10) / 2 = 20 mins
      expect(result.summary.mttr).toBe(20);
    });

    test('should calculate exact Availability based on recovery windows', async () => {
        const start = new Date(fixedDate.getTime() - 60 * 60 * 1000);
        const crash = new Date(fixedDate.getTime() - 45 * 60 * 1000);
        const recovery = new Date(fixedDate.getTime() - 30 * 60 * 1000);
        const end = fixedDate; // 60 mins total window

        await prisma.devOpsMetric.createMany({
          data: [
            { type: 'START', payload: '{}', createdAt: start },
            { type: 'CRASH', payload: '{}', createdAt: crash },
            { type: 'APP_STARTUP_TIME', payload: '{"timeToFirstPrintMs": 100}', createdAt: recovery },
            { type: 'END', payload: '{}', createdAt: end },
          ]
        });

        const service = new AnalyticsService(prisma);
        const result = await service.getDevOpsMetrics(fixedDate, 60 * 60 * 1000); // 1 hour window

        // Downtime = 15 mins (45 to 30 mins ago)
        // Total range = 60 mins (passed as windowMs)
        // Availability = (1 - 15/60) * 100 = 75%
        expect(result.summary.availability).toBe(75);
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
      await prisma.user.createMany({ data: [{ id: 'u1', email: 'u1@t.com' }, { id: 'u2', email: 'u2@t.com' }] });
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
