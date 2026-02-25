import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../infra/prisma/client';
import { withAuth } from '../../../utils/withAuth';
import { QuizService } from '../../../controllers/quizController';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const quizService = new QuizService(prisma);

  if (req.method === 'GET') {
    const { categoryId, difficulty } = req.query;
    const questions = await quizService.getQuestions(
      categoryId as string,
      difficulty as string
    );
    res.status(200).json(questions.map(formatQuestion));
  } else if (req.method === 'POST') {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'ids must be an array' });
    }
    const questions = await quizService.getQuestionsByIds(ids);
    res.status(200).json(questions.map(formatQuestion));
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function formatQuestion(q: any) {
  return {
    id: q.id,
    question: `${q.title}${q.body ? ': ' + q.body : ''}`,
    category: q.category?.name || '',
    tags: q.tags?.map((t: any) => t.tag.name) || [],
    options: [
      { text: q.a, isCorrect: q.correct?.toUpperCase() === 'A' },
      { text: q.b, isCorrect: q.correct?.toUpperCase() === 'B' },
      { text: q.c, isCorrect: q.correct?.toUpperCase() === 'C' },
      { text: q.d, isCorrect: q.correct?.toUpperCase() === 'D' },
    ].filter(o => o.text)
  };
}

export default withAuth(handler);