import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/auth';
import { EngagementService } from '../../../controllers/engagementController';
import { prisma } from '../../../infra/prisma/client';

export async function notificationsHandler(req: NextApiRequest, res: NextApiResponse, service: EngagementService) {
    let user;
    try {
        user = await getAuthenticatedUser(req);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const notifications = await service.getNotifications(user.id);
            res.status(200).json(notifications);
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'POST') {
        const { message, type } = req.body;
        if (!message || !type) {
            return res.status(400).json({ message: 'Missing message or type' });
        }
        try {
            const notification = await service.createNotification(user.id, message, type);
            res.status(201).json(notification);
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const service = new EngagementService(prisma);
    return notificationsHandler(req, res, service);
}
