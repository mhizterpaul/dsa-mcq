import { PrismaClient } from '@prisma/client';
import { engagementService } from '../services/engagementService';

const prisma = new PrismaClient();

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

export default prisma;
