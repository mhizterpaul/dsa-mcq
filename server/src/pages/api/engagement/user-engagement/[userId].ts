import type { NextApiRequest, NextApiResponse } from 'next';
import { EngagementService } from '../../../../controllers/engagementController';
import { prisma } from '../../../../infra/prisma/client';
import { getAuthenticatedUser } from '../../../../utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const { userId } = req.query;
    const service = new EngagementService(prisma);

    let user;
    try {
        user = await getAuthenticatedUser(req);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Authorization: only the user themselves or an admin can access engagement data
    if (user.id !== userId && user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' });
    }

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
