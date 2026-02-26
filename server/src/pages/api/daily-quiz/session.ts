import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from "../../../controllers/quizController";
import { prisma } from "../../../infra/prisma/client";
import { getAuthenticatedUser } from '../../../utils/auth';

export async function sessionHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
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
            let session = await quizService.getOrCreateDailyQuizSession(user);
            if (!session) {
                return res.status(404).json({ message: 'No available groups. Please try again later.' });
            }
            await quizService.findOrCreateParticipant(session, user);

            // Re-fetch session to get the latest participant list
            const updatedSession = await quizService.getUserActiveSession(user.id);

            if (!updatedSession) {
                 return res.status(500).json({ message: 'Failed to retrieve session after creation' });
            }

            // Map to client expected format
            res.status(200).json({
                sessionId: updatedSession.id,
                participantCount: updatedSession.participants.length,
                participants: updatedSession.participants.map(p => ({
                    userId: p.userId,
                    name: p.user.name,
                    avatarUrl: p.user.image || 'https://via.placeholder.com/150'
                })),
                questionIds: ['1', '2', '3', '4', '5'] // Mocked question IDs for now
            });
        } catch (error: any) {
            console.error(error);
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
    return sessionHandler(req, res, service);
}
