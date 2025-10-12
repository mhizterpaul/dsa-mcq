import { PrismaClient } from '@prisma/client';

export class EngagementService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async logActions(actions: any[]) {
    const engagementData = actions.map((action) => ({
      ...action,
      timestamp: new Date(action.timestamp),
    }));

    await this.prisma.engagement.createMany({
      data: engagementData,
    });
  }
}