import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from '../../../services/quizService';
import { getAuthenticatedUser } from '../../../utils/auth';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '../../../services/cacheService';

export async function sessionsHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const session = await quizService.findOrCreateSessionForUser(user);

            // Convert Map to array for JSON serialization
            const participants = Array.from(session.participants.values());

            res.status(200).json({
                ...session,
                participants,
                sseConnections: undefined, // Don't send sseConnections to client
            });
        } catch (error) {
            console.error(error);
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
    const cache = new CacheService();
    const quizService = new QuizService(prisma, cache);
    return sessionsHandler(req, res, quizService);
}
