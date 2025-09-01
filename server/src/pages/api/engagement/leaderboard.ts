import type { NextApiRequest, NextApiResponse } from 'next';
import { engagementService } from '../../../services/engagementService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const leaderboard = await engagementService.getLeaderboard();
            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
