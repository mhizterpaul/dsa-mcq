import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/auth';
import { EngagementService } from '../../../services/engagementService';
import { engagementService } from '../../../services/engagementServiceInstance';

export async function settingsHandler(req: NextApiRequest, res: NextApiResponse, service: EngagementService) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const { quizTitle } = req.body;
        if (typeof quizTitle !== 'string') {
            return res.status(400).json({ message: 'Invalid quizTitle' });
        }

        service.updateGlobalSettings({ quizTitle });
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
    return settingsHandler(req, res, engagementService);
}
