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
            const versionQuery = req.query.version as string;
            const lastKnownVersion = (versionQuery !== undefined && versionQuery !== '' && versionQuery !== 'NaN') ? parseInt(versionQuery) : NaN;

            // If no version provided, return current state immediately (no long polling)
            if (isNaN(lastKnownVersion)) {
                const session = await quizService.getUserActiveSession(user.id);
                if (!session) {
                    const availableSession = await quizService.getOrCreateDailyQuizSession(user);
                    if (!availableSession) {
                        return res.status(200).json({ status: 'WAITING', version: 0 });
                    }
                    return res.status(200).json({
                        status: 'AVAILABLE',
                        sessionId: availableSession.id,
                        version: availableSession.updatedAt ? availableSession.updatedAt.getTime() : 0
                    });
                }
                const participants = await quizService.getSessionParticipants(session.id);
                return res.status(200).json({
                    status: session.endTime ? 'FINISHED' : 'IN_PROGRESS',
                    sessionId: session.id,
                    version: session.updatedAt ? session.updatedAt.getTime() : 0,
                    participants,
                    endTime: session.endTime,
                });
            }

            const startTime = Date.now();
            const timeout = 5000; // 5 seconds long polling

            while (Date.now() - startTime < timeout) {
                const session = await quizService.getUserActiveSession(user.id);

                if (!session) {
                    const availableSession = await quizService.getOrCreateDailyQuizSession(user);
                    if (!availableSession) {
                        if (lastKnownVersion === 0) {
                           return res.status(200).json({ status: 'WAITING', version: 0 });
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        continue;
                    }
                    const currentVersion = availableSession.updatedAt ? availableSession.updatedAt.getTime() : 0;
                    if (lastKnownVersion === currentVersion) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        continue;
                    }
                    return res.status(200).json({ status: 'AVAILABLE', sessionId: availableSession.id, version: currentVersion });
                }

                const currentVersion = session.updatedAt ? session.updatedAt.getTime() : 0;

                if (lastKnownVersion === currentVersion) {
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

            // Timeout reached, return 304 Not Modified
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
