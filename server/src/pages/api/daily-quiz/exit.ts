import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from '../../../services/quizService';
import { getAuthenticatedUser } from '../../../utils/auth';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '../../../services/cacheService';

export function exitHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const session = quizService.getOrCreateDailyQuizSession();
        quizService.removeParticipant(session.id, user.id);
        res.status(200).json({ success: true, message: 'Exited quiz' });
    } else {
        res.setHeader('Allow', ['POST']);
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
    return exitHandler(req, res, quizService);
}
