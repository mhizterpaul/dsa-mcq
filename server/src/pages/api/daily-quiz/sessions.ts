import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from '../../../controllers/quizController';
import { getAuthenticatedUser } from '../../../utils/auth';
import { prisma } from '../../../infra/prisma/client';

export async function sessionsHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            let session = await quizService.getOrCreateDailyQuizSession(user);
            if (!session) {
                return res.status(404).json({ message: 'No available groups. Please try again later.' });
            }
            await quizService.findOrCreateParticipant(session, user);

            // Re-fetch session to get the latest participant list
            session = await quizService.getOrCreateDailyQuizSession(user);

            res.status(200).json(session);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: error.message || 'Internal Server Error' });
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
    return sessionsHandler(req, res, quizService);
}
