import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from "../../../controllers/quizController";
import { prisma } from "../../../infra/prisma/client";
import { getAuthenticatedUser } from '../../../utils/auth';

export async function sessionsHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
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
    const service = new QuizService(prisma);
    return sessionsHandler(req, res, service);
}
