import type { NextApiRequest, NextApiResponse } from 'next';
import { EngagementService } from '../../../controllers/engagementController';
import { prisma } from '../../../infra/prisma/client';

export async function leaderboardHandler(req: NextApiRequest, res: NextApiResponse, service: EngagementService) {
    if (req.method === 'GET') {
        try {
            const leaderboard = await service.getLeaderboard();
            res.status(200).json(leaderboard);
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
    return leaderboardHandler(req, res, service);
}
