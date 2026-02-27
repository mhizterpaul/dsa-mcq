import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/auth';
import { EngagementService } from '../../../controllers/engagementController';
import { prisma } from '../../../infra/prisma/client';
import { withAuth, AuthenticatedRequest } from '../../../utils/withAuth';

export async function achievementsHandler(req: AuthenticatedRequest, res: NextApiResponse, service: EngagementService) {
    if (req.method === 'GET') {
        try {
            const achievements = await service.getAchievements(req.user.id);
            res.status(200).json(achievements);
        } catch (error: any) {
            console.error('achievements error:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}

export default withAuth(async (req, res) => {
    const service = new EngagementService(prisma);
    return achievementsHandler(req, res, service);
});
