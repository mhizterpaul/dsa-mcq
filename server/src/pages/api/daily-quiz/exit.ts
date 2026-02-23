import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from "../../../controllers/quizController";
import { prisma } from "../../../infra/prisma/client";
import { getAuthenticatedUser } from '../../../utils/auth';

export async function exitHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const session = await quizService.getOrCreateDailyQuizSession();
        if (session) {
            await quizService.removeParticipant(session.id, user.id);
        }
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
    const service = new QuizService(prisma);
    return exitHandler(req, res, service);
}
