import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/analytics/devops';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('/api/analytics/devops', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return a 500 error when fetching metrics', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });

  it('should return a 500 error when creating a metric', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        type: 'CRASH',
        payload: {
          errorMessage: 'Test error',
          stackTrace: 'Test stack trace',
          severity: 'critical',
        },
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
