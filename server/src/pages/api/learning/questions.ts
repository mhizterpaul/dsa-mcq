import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../infra/prisma/client';
import { withAuth } from '../../../utils/withAuth';
import { QuizService } from '../../../controllers/quizController';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const quizService = new QuizService(prisma);

  if (req.method === 'GET') {
    const { categoryId, difficulty, revealAnswers } = req.query;
    if (!categoryId) {
        return res.status(400).json({ message: 'categoryId is required' });
    }
    if (difficulty && !['easy', 'medium', 'hard'].includes((difficulty as string).toLowerCase())) {
        return res.status(400).json({ message: 'Invalid difficulty' });
    }
    const questions = await quizService.getQuestions(
      categoryId as string,
      difficulty as string
    );
    const shouldReveal = revealAnswers === 'true';
    res.status(200).json(questions.map(q => formatQuestion(q, shouldReveal)).slice(0, 50));
  } else if (req.method === 'POST') {
    const { ids, revealAnswers } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'ids must be an array' });
    }
    if (ids.length > 50) {
      return res.status(400).json({ message: 'Maximum 50 questions per request' });
    }
    if (ids.some(id => typeof id !== 'number')) {
      return res.status(400).json({ message: 'ids must be an array of numbers' });
    }
    const questions = await quizService.getQuestionsByIds(ids);
    const shouldReveal = revealAnswers === true;
    res.status(200).json(questions.map(q => formatQuestion(q, shouldReveal)));
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function formatQuestion(q: any, revealAnswers: boolean) {
  return {
    id: q.id,
    question: `${q.title}${q.body ? ': ' + q.body : ''}`,
    category: q.category?.name || '',
    tags: q.tags?.map((t: any) => t.tag.name) || [],
    options: [
      { text: q.a, ...(revealAnswers && { isCorrect: q.correct?.toUpperCase() === 'A' }) },
      { text: q.b, ...(revealAnswers && { isCorrect: q.correct?.toUpperCase() === 'B' }) },
      { text: q.c, ...(revealAnswers && { isCorrect: q.correct?.toUpperCase() === 'C' }) },
      { text: q.d, ...(revealAnswers && { isCorrect: q.correct?.toUpperCase() === 'D' }) },
    ].filter(o => o.text)
  };
}

export default withAuth(handler);