import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from '../../../services/quizService';
import { getAuthenticatedUser } from '../../../utils/auth';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '../../../services/cacheService';

export function resultsHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        const session = quizService.getOrCreateDailyQuizSession();
        const results = Array.from(session.participants.values());

        res.status(200).json({
            sessionId: session.id,
            results,
        });
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const prisma = new PrismaClient();
    const cache = new CacheService();
    const quizService = new QuizService(prisma, cache);
    return resultsHandler(req, res, quizService);
}
