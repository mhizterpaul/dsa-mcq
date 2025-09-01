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
        const { xp } = req.body;
        if (typeof xp !== 'number') {
            return res.status(400).json({ message: 'Invalid XP amount' });
        }

        try {
            await engagementService.updateUserXP(user.id, xp);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
