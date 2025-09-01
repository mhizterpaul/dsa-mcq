import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/auth';
import { engagementService } from '../../../services/engagementService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
