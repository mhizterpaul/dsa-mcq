import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

export async function questionsHandler(req: NextApiRequest, res: NextApiResponse, prisma: PrismaClient) {
  if (req.method === 'POST') {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Request body must be an object with an "ids" array.' });
    }

    const requestedQuestions = await prisma.question.findMany({
        where: {
            id: {
                in: ids.map(String),
            },
        },
    });
    return res.status(200).json(requestedQuestions);

  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const prisma = new PrismaClient();
    return questionsHandler(req, res, prisma);
}
