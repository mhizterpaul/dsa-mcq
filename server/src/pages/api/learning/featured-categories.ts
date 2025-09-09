import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/auth';
import { AnalyticsService } from '../../../services/analyticsService';
import { PrismaClient } from '@prisma/client';

export async function featuredCategoriesHandler(req: NextApiRequest, res: NextApiResponse, analyticsService: AnalyticsService) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const categories = await analyticsService.getFeaturedCategories();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const prisma = new PrismaClient();
    const analyticsService = new AnalyticsService(prisma);
    return featuredCategoriesHandler(req, res, analyticsService);
}
