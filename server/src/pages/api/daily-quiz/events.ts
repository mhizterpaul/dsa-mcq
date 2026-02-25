import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from '../../../controllers/quizController';
import { getAuthenticatedUser } from '../../../utils/auth';
import { prisma } from '../../../infra/prisma/client';

export async function eventsHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        if (res.flushHeaders) res.flushHeaders();

        const session = await quizService.getOrCreateDailyQuizSession(user);

        if (!session) {
            quizService.addToWaitingList(user.id, res);
            res.write(`data: ${JSON.stringify({ type: 'waiting' })}\n\n`);
        } else {
            quizService.addSseConnection(session.id, user.id, res);
            // Send a connected event
            res.write(`data: ${JSON.stringify({ type: 'connected', sessionId: session.id })}\n\n`);
        }

        req.on('close', () => {
            if (session) {
                quizService.removeSseConnection(session.id, user.id);
            }
            res.end();
        });
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
    return eventsHandler(req, res, quizService);
}
