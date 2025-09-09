import { PrismaClient } from '@prisma/client';
import { CacheService } from './cacheService';

interface GlobalSettings {
    quizTitle: string;
}

export class EngagementService {
    private prisma: PrismaClient;
    private cache: CacheService;
    private globalSettings: GlobalSettings = {
        quizTitle: 'Default Quiz Title',
    };

    constructor(prisma: PrismaClient, cache: CacheService) {
        this.prisma = prisma;
        this.cache = cache;
    }

    async updateUserXP(userId: string, xpGained: number) {
        const engagement = await this.prisma.engagement.upsert({
            where: { userId },
            update: { xp: { increment: xpGained } },
            create: { userId, xp: xpGained },
        });
        return engagement;
    }

    async getLeaderboard() {
        return this.prisma.engagement.findMany({
            orderBy: { xp: 'desc' },
            take: 10,
            include: { user: { select: { name: true, image: true } } },
        });
    }

    async getWeeklyKing() {
        // This is a placeholder. A real implementation would query based on a weekly timestamp.
        const topUser = await this.prisma.engagement.findFirst({
            orderBy: { xp: 'desc' },
            include: { user: { select: { name: true } } },
        });
        return topUser;
    }

    getGlobalSettings() {
        return this.globalSettings;
    }

    updateGlobalSettings(newSettings: Partial<GlobalSettings>) {
        this.globalSettings = { ...this.globalSettings, ...newSettings };
        return this.globalSettings;
    }
}
