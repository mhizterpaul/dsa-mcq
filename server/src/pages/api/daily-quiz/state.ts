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
            const lastKnownVersion = parseInt(req.query.version as string);
            const startTime = Date.now();
            const timeout = 5000; // 5 seconds long polling

            while (Date.now() - startTime < timeout) {
                const session = await quizService.getUserActiveSession(user.id);

                if (!session) {
                    const availableSession = await quizService.getOrCreateDailyQuizSession(user);
                    if (!availableSession) {
                        if (lastKnownVersion === 0) { // Using 0 as "no version" indicator
                           return res.status(200).json({ status: 'WAITING', version: 0 });
                        }
                        // Long poll wait
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        continue;
                    }
                    const currentVersion = availableSession.updatedAt.getTime();
                    if (lastKnownVersion === currentVersion) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        continue;
                    }
                    return res.status(200).json({ status: 'AVAILABLE', sessionId: availableSession.id, version: currentVersion });
                }

                const currentVersion = session.updatedAt.getTime();

                if (lastKnownVersion === currentVersion) {
                    // Long poll: wait for change
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }

                const participants = await quizService.getSessionParticipants(session.id);

                return res.status(200).json({
                    status: session.endTime ? 'FINISHED' : 'IN_PROGRESS',
                    sessionId: session.id,
                    version: currentVersion,
                    participants,
                    endTime: session.endTime,
                });
            }

            // Timeout reached, return current state (even if same version) or 304
            // Returning 304 is standard for long polling with no changes
            return res.status(304).end();

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
