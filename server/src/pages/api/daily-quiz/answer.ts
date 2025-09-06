import type { NextApiRequest, NextApiResponse } from 'next';
import { quizService } from '../../../services/quizService';
import { getAuthenticatedUser } from '../../../utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const { questionId, answer } = req.body;
        const session = await quizService.findOrCreateSessionForUser(user);

        try {
            const result = await quizService.handleAnswer(session.id, user.id, questionId, answer);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
