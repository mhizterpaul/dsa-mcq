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
            // Find any session this user participated in today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let session = await prisma.quizSession.findFirst({
                where: {
                    date: today,
                    participants: { some: { userId: user.id } }
                }
            });

            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }

            // Auto-end session if user is requesting results and it's not ended?
            // Or maybe only end it if timer expired.
            const now = new Date();
            const startTime = new Date(session.startTime);
            const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000;

            if (!session.endTime && elapsedSeconds > 300) {
                session = await quizService.endSession(session.id);
            }

            if (!session.endTime) {
                // For testing purposes, let's allow ending it manually if requested or just end it now
                session = await quizService.endSession(session.id);
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
