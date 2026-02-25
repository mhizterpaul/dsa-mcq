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
      orderBy: { xp: 'desc' },
      take: 10,
    });
  }

  async updateGlobalSettings(settings: { quizTitle: string }) {
    // Implementation for updating global settings
    console.log('Updating global settings:', settings);
  }

  async getWeeklyKing() {
    return this.prisma.user.findFirst({
      orderBy: { xp_weekly: 'desc' },
    });
  }

  async updateUserXP(userId: string, xp: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xp } },
    });
  }

  async resetWeeklyXP() {
    return this.prisma.user.updateMany({
      data: { xp_weekly: 0 },
    });
  }

  async resetMonthlyXP() {
    return this.prisma.user.updateMany({
      data: { xp_monthly: 0 },
    });
  }
}