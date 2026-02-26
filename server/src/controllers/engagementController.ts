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

  async getLeaderboard() {
    return this.prisma.user.findMany({
      orderBy: { engagement: { xp: 'desc' } },
      take: 10,
      include: { engagement: true }
    });
  }

  async updateGlobalSettings(settings: { quizTitle: string }) {
    // Implementation for updating global settings
    console.log('Updating global settings:', settings);
  }

  async getWeeklyKing() {
    return this.prisma.user.findFirst({
      orderBy: { engagement: { xp_weekly: 'desc' } },
      include: { engagement: true }
    });
  }

  async updateUserXP(userId: string, xp: number) {
    return this.prisma.engagement.update({
      where: { userId: userId },
      data: { xp: { increment: xp } },
    });
  }

  async resetWeeklyXP() {
    return this.prisma.engagement.updateMany({
      data: { xp_weekly: 0 },
    });
  }

  async resetMonthlyXP() {
    return this.prisma.engagement.updateMany({
      data: { xp_monthly: 0 },
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
