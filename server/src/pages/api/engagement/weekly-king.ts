import type { NextApiRequest, NextApiResponse } from 'next';
import { EngagementService } from '../../../services/engagementService';
import { engagementService } from '../../../services/engagementServiceInstance';

export async function weeklyKingHandler(req: NextApiRequest, res: NextApiResponse, service: EngagementService) {
    if (req.method === 'GET') {
        try {
            const weeklyKing = await service.getWeeklyKing();
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
    return weeklyKingHandler(req, res, engagementService);
}
