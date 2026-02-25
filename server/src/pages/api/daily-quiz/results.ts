import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from "../../../controllers/quizController";
import { prisma } from "../../../infra/prisma/client";
import { getAuthenticatedUser } from '../../../utils/auth';

export async function resultsHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    let user;
    try {
        user = await getAuthenticatedUser(req);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
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
    const service = new QuizService(prisma);
    return resultsHandler(req, res, service);
}
