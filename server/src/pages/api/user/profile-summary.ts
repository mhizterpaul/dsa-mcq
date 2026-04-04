import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/withAuth';
import { userController } from '../../../controllers/userController';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { FileCacheProvider } = await import('../../../infra/fileCacheProvider');
  const cache = new FileCacheProvider();
  const cacheKey = `profile-summary:${req.user.id}`;

  try {
    const profileSummary = await userController.getProfileSummary(req.user.id);
    // Cache the result for 1 hour
    await cache.set(cacheKey, profileSummary, 3600);
    res.status(200).json({ ...profileSummary, source: 'DB' });
  } catch (error: any) {
    // Fallback to cache
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({ ...cachedData, source: 'CACHE' });
    }
    res.status(500).json({ message: error.message });
  }
}

export default withAuth(handler);
