import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from '../../../controllers/quizController';
import { getAuthenticatedUser } from '../../../utils/auth';
import { prisma } from '../../../infra/prisma/client';

export async function exitHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        try {
            const session = await quizService.getOrCreateDailyQuizSession(user);
            if (session) {
                await quizService.removeParticipant(session.id, user.id);
            }
            res.status(200).json({ success: true, message: 'Exited quiz' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const quizService = new QuizService(prisma);
    return exitHandler(req, res, quizService);
}
