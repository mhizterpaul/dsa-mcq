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

  async getAverageUserPerformance(): Promise<number> {
    const aggregate = await this.prisma.engagement.aggregate({
      _avg: {
        xp: true,
      },
    });
    return aggregate._avg.xp || 0;
  }
}