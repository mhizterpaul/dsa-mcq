import { PrismaClient } from '@prisma/client';

export class AnalyticsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getDevOpsMetrics() {
    return this.prisma.devOpsMetric.findMany();
  }
}