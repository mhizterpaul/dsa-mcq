import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../infra/prisma/client';
import { withAuth } from '../../../utils/withAuth';
import { QuizService } from '../../../controllers/quizController';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { categoryId, difficulty } = req.query;
    const quizService = new QuizService(prisma);
    const questions = await quizService.getQuestions(
      categoryId as string,
      difficulty as string
    );
    res.status(200).json(questions);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);