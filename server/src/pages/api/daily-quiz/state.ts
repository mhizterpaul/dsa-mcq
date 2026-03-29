import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from "../../../controllers/quizController";
import { prisma } from "../../../infra/prisma/client";
import { getAuthenticatedUser } from '../../../utils/auth';

export async function stateHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
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
            const session = await quizService.getUserActiveSession(user.id);
            if (!session) {
                // If no active session for user, check if any is available (like in getOrCreate)
                const availableSession = await quizService.getOrCreateDailyQuizSession(user);
                if (!availableSession) {
                    return res.status(200).json({ status: 'WAITING' });
                }
                return res.status(200).json({ status: 'AVAILABLE', sessionId: availableSession.id });
            }

            const participants = await quizService.getSessionParticipants(session.id);

            res.status(200).json({
                status: session.endTime ? 'FINISHED' : 'IN_PROGRESS',
                sessionId: session.id,
                version: session.updatedAt.getTime(),
                participants,
                endTime: session.endTime,
            });
        } catch (error: any) {
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
    const service = new QuizService(prisma);
    return stateHandler(req, res, service);
}
