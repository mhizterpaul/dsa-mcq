import type { NextApiRequest, NextApiResponse } from 'next';
import { engagementService } from '../../../services/engagementService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const weeklyKing = await engagementService.getWeeklyKing();
            res.status(200).json(weeklyKing);
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
