import { NextApiResponse } from 'next';
import { prisma as defaultPrisma } from '../../../infra/prisma/client';
import { withAdmin } from '../../../utils/withAdmin';
import { AuthenticatedRequest } from '../../../utils/withAuth';
import { PrismaClient } from '@prisma/client';

export async function devopsHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  deps: { prisma: PrismaClient } = { prisma: defaultPrisma }
) {
  if (req.method === 'GET') {
    const metrics = await deps.prisma.devOpsMetric.findMany();
    res.status(200).json(metrics);
  } else if (req.method === 'POST') {
    const { type, payload } = req.body;
    const newMetric = await deps.prisma.devOpsMetric.create({
      data: {
        type,
        payload: JSON.stringify(payload),
      },
    });
    res.status(201).json(newMetric);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAdmin(devopsHandler);