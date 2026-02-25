import { NextApiResponse } from 'next';
import { prisma as defaultPrisma } from '../../../infra/prisma/client';
import { withAdmin } from '../../../utils/withAdmin';
import { AuthenticatedRequest } from '../../../utils/withAuth';
import { PrismaClient } from '@prisma/client';
import { AnalyticsService } from '../../../controllers/analyticsController';
import { EngagementService } from '../../../controllers/engagementController';

export async function devopsHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  deps: { prisma: PrismaClient } = { prisma: defaultPrisma }
) {
  const analyticsService = new AnalyticsService(deps.prisma);
  const engagementService = new EngagementService(deps.prisma);

  if (req.method === 'GET') {
    const devopsMetrics = await analyticsService.getDevOpsMetrics();
    const averageUserPerformance = await engagementService.getAverageUserPerformance();

    res.status(200).json({
      ...devopsMetrics,
      summary: {
        ...devopsMetrics.summary,
        averageUserPerformance,
      }
    });
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