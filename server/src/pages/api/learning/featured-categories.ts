import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../infra/prisma/client';
import { withAuth } from '../../../utils/withAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const categories = await prisma.category.findMany({
      where: {
        featured: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: 20,
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });
    res.status(200).json(categories);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export default withAuth(handler);