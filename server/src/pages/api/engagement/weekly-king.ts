import type { NextApiRequest, NextApiResponse } from 'next';
import { EngagementService } from '../../../services/engagementService';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '../../../services/cacheService';

export async function weeklyKingHandler(req: NextApiRequest, res: NextApiResponse, engagementService: EngagementService) {
    if (req.method === 'GET') {
        try {
            const weeklyKing = await engagementService.getWeeklyKing();
            res.status(200).json(weeklyKing);
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const prisma = new PrismaClient();
    const cache = new CacheService();
    const engagementService = new EngagementService(prisma, cache);
    return weeklyKingHandler(req, res, engagementService);
}
