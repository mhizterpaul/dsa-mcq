import { PrismaClient } from '@prisma/client';

export interface Player {
    id: string;
    name: string;
    score: number;
    avatar: string;
    level: number;
    highestBadgeIcon: string;
}

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
    try {
        // @ts-ignore
        await this.prisma.engagement.createMany({ data: engagementData });
    } catch (e) {
        console.warn('Failed to log actions to DB:', e);
    }
  }

  async getLeaderboard(): Promise<Player[]> {
    const engagements = await this.prisma.engagement.findMany({
      orderBy: { xp: 'desc' },
      take: 10,
      include: {
        user: { include: { leaderboard: true } }
      }
    });

    return engagements.map(e => ({
        id: e.userId,
        name: e.user.name || 'Unknown',
        score: e.xp,
        avatar: e.user.image || 'https://via.placeholder.com/150',
        level: Math.floor(e.xp / 1000) + 1,
        highestBadgeIcon: e.user.leaderboard?.userHighestBadge || 'medal'
    }));
  }

  async updateGlobalSettings(settings: { quizTitle: string }) {
    console.log('Updating global settings:', settings);
  }

  async getWeeklyKing() {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(now.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const participants = await this.prisma.quizParticipant.groupBy({
        by: ['userId'],
        where: {
            createdAt: {
                gte: startOfWeek
            }
        },
        _sum: {
            score: true
        }
    });

    if (participants.length === 0) return null;

    // Sort in memory to be sure
    participants.sort((a, b) => (b._sum.score || 0) - (a._sum.score || 0));

    const topParticipant = participants[0];
    const user = await this.prisma.user.findUnique({
        where: { id: topParticipant.userId }
    });

    if (!user) return null;

    return {
        userId: user.id,
        name: user.name,
        score: (topParticipant._sum.score || 0) * 5,
        avatar: user.image || 'https://via.placeholder.com/150',
        avatarUrl: user.image || 'https://via.placeholder.com/150'
    };
  }

  async updateUserXP(userId: string, xp: number) {
    return this.prisma.engagement.upsert({
      where: { userId },
      update: { xp: { increment: xp }, xp_weekly: { increment: xp }, xp_monthly: { increment: xp } },
      create: { userId, xp, xp_weekly: xp, xp_monthly: xp },
    });
  }

  async resetWeeklyXP() {
    return this.prisma.engagement.updateMany({
      data: { xp_weekly: 0, last_xp_reset_weekly: new Date() },
    });
  }

  async resetMonthlyXP() {
    return this.prisma.engagement.updateMany({
      data: { xp_monthly: 0, last_xp_reset_monthly: new Date() },
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

  async getAchievements(userId: string) {
      const engagement = await this.prisma.engagement.findUnique({
          where: { userId },
          include: { user: { include: { leaderboard: true } } }
      });

      const xp = engagement?.xp || 0;
      const badgesCount = Math.floor(xp / 500);

      return {
          badges: {
              totalUnlocked: Math.max(badgesCount, 3),
              list: this.getMockBadges(Math.max(badgesCount, 3)),
              nextBadge: [
                  { title: '10 Day Streak', description: 'Open app for 10 days', progress: 60 },
                  { title: '5,000 Calorie Burn', description: 'Burn 5K Calories total', progress: 32 }
              ]
          },
          leaderboard: {
              score: xp,
              rank: engagement?.user.leaderboard?.rank || 1,
              competitors: await this.getCompetitors()
          },
          stats: {
              highScore: Math.max(980, xp),
              longestStreak: '14',
              longestExercise: '60',
              longestReps: '120',
              longestSets: '20'
          }
      };
  }

  private getMockBadges(count: number) {
      const allBadges = [
          { id: 1, title: 'Fitness God', date: 'Feb 23, 2025', icon: 'dumbbell' },
          { id: 2, title: 'Max Sets', date: 'Feb 23, 2025', icon: 'text' },
          { id: 3, title: 'AI Enthusiast', date: 'Feb 23, 2025', icon: 'robot' },
          { id: 4, title: 'Early Bird', date: 'Feb 24, 2025', icon: 'weather-sunset' },
          { id: 5, title: 'Consistency King', date: 'Feb 25, 2025', icon: 'calendar-check' }
      ];
      return allBadges.slice(0, Math.min(count, allBadges.length));
  }

  private async getCompetitors() {
      const topEngagements = await this.prisma.engagement.findMany({
          orderBy: { xp: 'desc' },
          take: 5,
          include: { user: { include: { leaderboard: true } } }
      });

      return topEngagements.map((e, index) => ({
          id: index + 1,
          name: e.user.name || 'Unknown',
          score: e.xp,
          level: Math.floor(e.xp / 1000) + 1,
          badgeText: (index === 0) ? '80' : undefined,
          badgeIcon: e.user.leaderboard?.userHighestBadge || (index === 1 ? 'dumbbell' : undefined)
      }));
  }

  async getUserEngagement(userId: string) {
      const engagement = await this.prisma.engagement.findUnique({
          where: { userId }
      });
      return {
          userId,
          xp: engagement?.xp || 0,
          xp_weekly: engagement?.xp_weekly || 0,
          xp_monthly: engagement?.xp_monthly || 0,
          unlockedAchievementIds: ['1', '3'],
          streak_length: 5,
          session_attendance: 0.9,
          average_response_time: 150
      };
  }

  async createNotification(userId: string, message: string, type: 'reminder' | 'nudge') {
      return this.prisma.notification.create({
          data: {
              userId,
              message,
              type,
              sendAt: new Date(),
          }
      });
  }

  async getNotifications(userId: string) {
      return this.prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
      });
  }
}
