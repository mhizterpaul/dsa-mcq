import { NextApiResponse } from 'next';
import { prisma as defaultPrisma } from '../../infra/prisma/client';
import { withAuth, AuthenticatedRequest } from '../../utils/withAuth';
import { withClientSignature } from '../../utils/withClientSignature';
import { SyncService } from '../../controllers/syncController';
import { PrismaClient } from '@prisma/client';

async function syncHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  deps: { prisma: PrismaClient } = { prisma: defaultPrisma }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const syncService = new SyncService(deps.prisma);
  const dirtyData = req.body;

  try {
    const syncedData = await syncService.sync(req.user.id, req.user.role, dirtyData);
    res.status(200).json(syncedData);
  } catch (error: any) {
    if (error.message.includes('Invalid payload') || error.message.includes('Invalid date')) {
        return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Sync already in progress for this user') {
        return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
}

export default withAuth(async (req, res) => {
    if (req.method !== 'POST') {
        await syncHandler(req, res);
        return;
    }
    await withClientSignature(syncHandler)(req, res);
});
