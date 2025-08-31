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
        const session = quizService.getOrCreateDailyQuizSession();
        quizService.addParticipant(session.id, user);

        // Convert Map to array for JSON serialization
        const participants = Array.from(session.participants.values());

        res.status(200).json({
            ...session,
            participants,
            sseConnections: undefined, // Don't send sseConnections to client
        });
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
