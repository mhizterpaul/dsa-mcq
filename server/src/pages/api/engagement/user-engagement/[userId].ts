import type { NextApiRequest, NextApiResponse } from 'next';
import { EngagementService } from '../../../../controllers/engagementController';
import { prisma } from '../../../../infra/prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const { userId } = req.query;
    const service = new EngagementService(prisma);

    if (req.method === 'GET') {
        if (typeof userId === 'string') {
            try {
                const data = await service.getUserEngagement(userId);
                res.status(200).json(data);
            } catch (error) {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            res.status(400).json({ error: 'Invalid userId' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
