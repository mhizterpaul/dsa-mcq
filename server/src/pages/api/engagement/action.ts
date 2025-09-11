import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/auth';
import { EngagementService } from '../../../services/engagementService';
import { engagementService } from '../../../services/engagementServiceInstance';

export async function actionHandler(req: NextApiRequest, res: NextApiResponse, service: EngagementService) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const { xp } = req.body;
        if (typeof xp !== 'number') {
            return res.status(400).json({ message: 'Invalid XP amount' });
        }

        try {
            await service.updateUserXP(user.id, xp);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    return actionHandler(req, res, engagementService);
}
