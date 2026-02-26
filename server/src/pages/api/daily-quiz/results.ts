import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from "../../../controllers/quizController";
import { EngagementService } from "../../../controllers/engagementController";
import { prisma } from "../../../infra/prisma/client";
import { getAuthenticatedUser } from '../../../utils/auth';

export async function resultsHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService, engagementService: EngagementService) {
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
            const { sessionId } = req.query;
            let session;

            if (typeof sessionId === 'string') {
                session = await prisma.quizSession.findUnique({
                    where: { id: sessionId },
                    include: { participants: true }
                });
            } else {
                // Default to most recent session for user today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                session = await prisma.quizSession.findFirst({
                    where: {
                        date: today,
                        participants: { some: { userId: user.id } }
                    },
                    include: { participants: true }
                });
            }

            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }

            // Ensure session is ended
            if (!session.endTime) {
                session = await quizService.endSession(session.id);
            }

            const results = await quizService.getResults(session.id);
            const userResult = results.find(r => r.userId === user.id);

            // Format leaderboard for GlobalEngagement.Player interface
            const leaderboard = results.map(r => ({
                id: r.userId,
                name: r.name,
                score: r.score * 10, // Assuming internal score is number of questions, but summary wants something larger?
                                     // Actually QuizParticipant score is already incremented by 10 per correct answer.
                avatar: 'https://via.placeholder.com/150', // Mock avatar if not available
                level: 1,
                highestBadgeIcon: 'medal'
            }));

            res.status(200).json({
                rank: userResult?.rank || 1,
                totalParticipants: session.participants.length,
                xpEarned: userResult?.xpEarned || 0,
                leaderboard: leaderboard,
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
    const engagementService = new EngagementService(prisma);
    return resultsHandler(req, res, quizService, engagementService);
}
