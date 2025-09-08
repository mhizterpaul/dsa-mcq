import { PrismaClient } from '@prisma/client';
import { engagementService } from '../services/engagementService';

// Extend global type for Prisma (to persist client across hot reloads in dev)
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'], // optional logging
  });

// Middleware for Engagement model XP updates
prisma.$use(async (params, next) => {
  if (params.model === 'Engagement' && params.action === 'update') {
    if (params.args.data.xp && typeof params.args.data.xp.increment === 'number') {
      const xpGained = params.args.data.xp.increment;

      // Add the same amount to weekly and monthly XP
      params.args.data.xp_weekly = {
        increment: xpGained,
      };
      params.args.data.xp_monthly = {
        increment: xpGained,
      };
    }
  }
  return next(params);
});

// Store Prisma client globally in dev
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
