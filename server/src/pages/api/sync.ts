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

// We swap the order: check method and signature FIRST, then auth.
// Actually withClientSignature requires the syncKey from auth.
// So we wrap syncHandler with signature check, then auth check.

export default withAuth((req, res) => {
    // For non-POST methods, we can skip signature check
    if (req.method !== 'POST') {
        return syncHandler(req, res);
    }
    return withClientSignature(syncHandler)(req, res);
});
