import type { NextApiRequest, NextApiResponse } from 'next';
import { QuizService } from "../../../controllers/quizController";
import { prisma } from "../../../infra/prisma/client";
import { getAuthenticatedUser } from '../../../utils/auth';

export async function answerHandler(req: NextApiRequest, res: NextApiResponse, quizService: QuizService) {
    let user;
    try {
        user = await getAuthenticatedUser(req);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const { questionId, answer } = req.body;

        try {
            const result = await quizService.handleAnswer(user.id, questionId, answer);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const service = new QuizService(prisma);
    return answerHandler(req, res, service);
}
