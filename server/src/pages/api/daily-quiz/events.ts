import type { NextApiRequest, NextApiResponse } from 'next';
import { quizService } from '../../../services/quizService';
import { getAuthenticatedUser } from '../../../utils/auth';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const session = quizService.getOrCreateDailyQuizSession();
        quizService.addSseConnection(session.id, user.id, res);

        // Send a connected event
        res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

        req.on('close', () => {
            quizService.removeSseConnection(session.id, user.id);
            res.end();
        });
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
