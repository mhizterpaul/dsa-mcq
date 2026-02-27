import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/auth';
import { EngagementService } from '../../../controllers/engagementController';
import { prisma } from '../../../infra/prisma/client';
import { withAuth, AuthenticatedRequest } from '../../../utils/withAuth';

export async function actionHandler(req: AuthenticatedRequest, res: NextApiResponse, service: EngagementService) {
    if (req.method === 'POST') {
        const { xp } = req.body;

        // Validation: required field and non-negative (including zero validation check if needed)
        if (xp === undefined || typeof xp !== 'number' || xp < 0) {
            return res.status(400).json({ message: 'Invalid XP amount' });
        }

        try {
            if (xp > 1000000) {
                return res.status(400).json({ message: 'XP amount too large' });
            }
            await service.updateUserXP(req.user.id, xp);
            res.status(200).json({ success: true });
        } catch (error: any) {
            if (error.message === 'Internal Database Error') {
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            res.status(400).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}

export default withAuth(async (req, res) => {
    const service = new EngagementService(prisma);
    return actionHandler(req, res, service);
});
