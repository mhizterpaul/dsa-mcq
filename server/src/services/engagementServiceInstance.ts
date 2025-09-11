import { PrismaClient } from '@prisma/client';
import { CacheService } from './cacheService';
import { EngagementService } from './engagementService';

const prisma = new PrismaClient();
const cache = new CacheService();

export const engagementService = new EngagementService(prisma, cache);
