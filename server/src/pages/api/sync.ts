import { NextApiRequest, NextApiResponse } from 'next';
import { prisma as defaultPrisma } from '../../infra/prisma/client';
import { withAuth } from '../../utils/withAuth';
import { withClientSignature } from '../../utils/withClientSignature';
import { EngagementService } from '../../controllers/engagementController';
import { PrismaClient } from '@prisma/client';

async function syncHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  deps: { prisma: PrismaClient } = { prisma: defaultPrisma }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const engagementService = new EngagementService(deps.prisma);

  const { actions } = req.body;

  try {
    await engagementService.logActions(actions);
    res.status(200).json({ message: 'Sync successful' });
  } catch (error: any) {
    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
}

export default withAuth(withClientSignature(syncHandler));