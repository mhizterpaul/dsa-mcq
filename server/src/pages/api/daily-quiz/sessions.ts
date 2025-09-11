import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from '../../../services/quizService';
import { getAuthenticatedUser } from '../../../utils/auth';
import { quizService } from '../../../services/quizServiceInstance';

export async function sessionsHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            let session = await quizService.getOrCreateDailyQuizSession();
            await quizService.findOrCreateParticipant(session, user);

            // Re-fetch session to get the latest participant list
            session = await quizService.getOrCreateDailyQuizSession();

            res.status(200).json(session);
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
    return sessionsHandler(req, res, quizService);
}
