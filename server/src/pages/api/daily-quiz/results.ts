import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from '../../../services/quizService';
import { getAuthenticatedUser } from '../../../utils/auth';
import { quizService } from '../../../services/quizServiceInstance';

export async function resultsHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        const session = await quizService.getOrCreateDailyQuizSession();

        res.status(200).json({
            sessionId: session.id,
            results: session.participants,
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
    return resultsHandler(req, res, quizService);
}
