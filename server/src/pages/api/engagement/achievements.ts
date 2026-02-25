import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/auth';
import { EngagementService } from '../../../controllers/engagementController';
import { prisma } from '../../../infra/prisma/client';

export async function achievementsHandler(req: NextApiRequest, res: NextApiResponse, service: EngagementService) {
    let user;
    try {
        user = await getAuthenticatedUser(req);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const achievements = await service.getAchievements(user.id);
            res.status(200).json(achievements);
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
    const service = new EngagementService(prisma);
    return achievementsHandler(req, res, service);
}
