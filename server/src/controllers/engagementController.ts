import { PrismaClient } from '@prisma/client';
import { ENGAGEMENT_CONSTANTS } from '../utils/constants';

export interface Player {
    id: string;
    name: string;
    score: number;
    avatar: string;
    level: number;
    rank: number;
    highestBadgeIcon: string;
}

export class EngagementService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async logActions(actions: any[]) {
    const engagementData = actions.map((action) => ({
      userId: action.userId,
      xp: action.xp || 0,
      xp_weekly: action.xp || 0,
      xp_monthly: action.xp || 0,
    }));

    for (const data of engagementData) {
        await this.prisma.engagement.upsert({
            where: { userId: data.userId },
            update: {
                xp: { increment: data.xp },
                xp_weekly: { increment: data.xp_weekly },
                xp_monthly: { increment: data.xp_monthly },
            },
            create: data
        });
    }
  }

  async getLeaderboard(): Promise<Player[]> {
    const engagements = await this.prisma.engagement.findMany({
      orderBy: [
          { xp: 'desc' },
          { userId: 'asc' } // Deterministic tie-breaking
      ],
      take: 10,
      include: {
        user: {
            include: {
                leaderboard: true
            }
        }
      }
    });

    return engagements.map((e, index) => ({
        id: e.userId,
        name: e.user.name || 'Unknown',
        score: e.xp,
        avatar: e.user.image || 'https://via.placeholder.com/150',
        level: Math.floor(e.xp / 1000) + 1,
        rank: index + 1,
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
    const diff = day === 0 ? -6 : 1 - day; // Monday as start of week
    startOfWeek.setDate(now.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Dynamic aggregation from quiz participants (strictly quiz data)
    const participants = await this.prisma.quizParticipant.groupBy({
        by: ['userId'],
        where: {
            createdAt: {
                gte: startOfWeek,
                lt: endOfWeek
            }
        },
        _sum: {
            score: true
        }
    });
    if (participants.length === 0) return null;

    // Deterministic sort: Sum of score desc, then userId asc
    participants.sort((a, b) => {
        const scoreA = a._sum.score || 0;
        const scoreB = b._sum.score || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.userId.localeCompare(b.userId);
    });

    const topParticipant = participants[0];
    const user = await this.prisma.user.findUnique({
        where: { id: topParticipant.userId }
    });

    if (!user) return null;

    return {
        userId: user.id,
        name: user.name,
        score: (topParticipant._sum.score || 0) * ENGAGEMENT_CONSTANTS.XP_MULTIPLIER,
        avatar: user.image || 'https://via.placeholder.com/150',
        avatarUrl: user.image || 'https://via.placeholder.com/150'
    };
  }

  async updateUserXP(userId: string, xp: number) {
    return this.prisma.engagement.upsert({
      where: { userId: userId },
      update: {
          xp: { increment: xp },
          xp_weekly: { increment: xp },
          xp_monthly: { increment: xp }
      },
      create: { userId, xp, xp_weekly: xp, xp_monthly: xp }
    });
  }

  async resetWeeklyXP() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.prisma.engagement.updateMany({
      where: {
          last_xp_reset_weekly: {
              lte: sevenDaysAgo
          }
      },
      data: {
          xp_weekly: 0,
          last_xp_reset_weekly: new Date()
      },
    });
  }

  private async calculateRank(xp: number): Promise<number> {
      const count = await this.prisma.engagement.count({
          where: {
              xp: {
                  gt: xp
              }
          }
      });
      return count + 1;
  }

  private calculateBadgesCount(engagement: any, isWeeklyKing: boolean) {
      let count = 0;
      if (engagement) {
          if (engagement.xp >= 500) count++;
          if (engagement.xp >= 1000) count++;
          if (engagement.xp >= 2000) count++;
      }
      if (isWeeklyKing) count++;
      return count;
  }

  private getBadgesList(engagement: any, isWeeklyKing: boolean) {
      const list = [];
      if (engagement) {
          if (engagement.xp >= 500) {
              list.push({ id: 1, title: 'Fitness God', date: 'Feb 23, 2025', icon: 'dumbbell' });
          }
          if (engagement.xp >= 1000) {
              list.push({ id: 2, title: 'Max Sets', date: 'Feb 23, 2025', icon: 'text' });
          }
          if (engagement.xp >= 2000) {
              list.push({ id: 4, title: 'Consistent Learner', date: 'Feb 23, 2025', icon: 'book-open' });
          }
      }
      if (isWeeklyKing) {
          list.push({ id: 3, title: 'Weekly King', date: new Date().toLocaleDateString(), icon: 'crown' });
      }
      return list;
  }

  private getNextBadges(engagement: any) {
      const xp = engagement?.xp || 0;
      const nextBadges = [];
      if (xp < 500) {
          nextBadges.push({ title: 'Fitness God', description: 'Reach 500 XP', progress: Math.floor((xp / 500) * 100) });
      } else if (xp < 1000) {
          nextBadges.push({ title: 'Max Sets', description: 'Reach 1000 XP', progress: Math.floor((xp / 1000) * 100) });
      }

      nextBadges.push({ title: '10 Day Streak', description: 'Open app for 10 days', progress: 60 });
      return nextBadges;
  }

  private async getCompetitors() {
    const topEngagements = await this.prisma.engagement.findMany({
      orderBy: [
          { xp: 'desc' },
          { userId: 'asc' }
      ],
      take: 5,
      include: {
          user: {
              include: {
                  leaderboard: true
              }
          }
      }
    });

    return topEngagements.map((e, index) => ({
        id: index + 1,
        name: e.user.name || 'Unknown',
        score: e.xp,
        level: Math.floor(e.xp / 1000) + 1,
        avatar: e.user.image || 'https://via.placeholder.com/150',
        badgeText: (index === 0) ? '80' : undefined,
        badgeIcon: e.user.leaderboard?.userHighestBadge || (index === 1 ? 'dumbbell' : undefined)
    }));
  }

  async getUserEngagement(userId: string) {
      const engagement = await this.prisma.engagement.findUnique({
          where: { userId }
      });
      if (!engagement) {
          return {
              userId,
              xp: 0,
              xp_weekly: 0,
              xp_monthly: 0,
              unlockedAchievementIds: [],
              streak_length: 0,
              session_attendance: 0,
              average_response_time: 0
          };
      }
      return {
          userId,
          xp: engagement.xp,
          xp_weekly: engagement.xp_weekly,
          xp_monthly: engagement.xp_monthly,
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
          orderBy: { createdAt: 'desc' } // Most recent first
      });
  }

  async getAchievements(userId: string) {
      const engagement = await this.prisma.engagement.findUnique({
          where: { userId },
          include: { user: { include: { leaderboard: true } } }
      });

      const weeklyKing = await this.getWeeklyKing();
      const isWeeklyKing = weeklyKing?.userId === userId;

      return {
          badges: this.getBadgesList(engagement, isWeeklyKing),
          leaderboard: {
              score: engagement?.xp || 0,
              rank: engagement ? await this.calculateRank(engagement.xp) : 0,
          },
          stats: {
              highScore: engagement?.xp || 0,
              longestStreak: '0 days',
              quizzesPlayed: 0
          }
      };
  }

  async getEarnedBadgesForSession(userId: string, sessionId: string) {
      const participant = await this.prisma.quizParticipant.findUnique({
          where: { userId_sessionId: { userId, sessionId } }
      });

      const badges = [];
      if (participant && participant.score >= 50) {
          badges.push({ id: 'fast-learner', name: 'Fast Learner' });
      }
      if (participant && participant.streak >= 5) {
          badges.push({ id: 'streak-master', name: 'Streak Master' });
      }

      return badges;
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
