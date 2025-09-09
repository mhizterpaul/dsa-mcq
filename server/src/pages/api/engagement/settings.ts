import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/auth';
import { EngagementService } from '../../../services/engagementService';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '../../../services/cacheService';

export async function settingsHandler(req: NextApiRequest, res: NextApiResponse, engagementService: EngagementService) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const { quizTitle } = req.body;
        if (typeof quizTitle !== 'string') {
            return res.status(400).json({ message: 'Invalid quizTitle' });
        }

        engagementService.updateGlobalSettings({ quizTitle });
        res.status(200).json({ success: true });
    } else {
        res.setHeader('Allow', ['POST']);
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
    return settingsHandler(req, res, engagementService);
}
