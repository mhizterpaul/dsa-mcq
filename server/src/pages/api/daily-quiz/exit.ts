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

    if (req.method === 'POST') {
        const session = quizService.getOrCreateDailyQuizSession();
        quizService.removeParticipant(session.id, user.id);
        res.status(200).json({ success: true, message: 'Exited quiz' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
