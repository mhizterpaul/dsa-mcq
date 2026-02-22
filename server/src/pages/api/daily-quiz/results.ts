import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from '../../../controllers/quizController';
import { getAuthenticatedUser } from '../../../utils/auth';
import { prisma } from '../../../infra/prisma/client';

export async function resultsHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const session = await quizService.getOrCreateDailyQuizSession(user);
            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }

            const results = await quizService.getResults(session.id);

            res.status(200).json({
                sessionId: session.id,
                results: results,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
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
    const quizService = new QuizService(prisma);
    return resultsHandler(req, res, quizService);
}
