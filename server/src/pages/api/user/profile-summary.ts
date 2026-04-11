import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/withAuth';
import { userController } from '../../../controllers/userController';
import { CacheService } from '../../../infra/cacheService';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const cache = new CacheService();
  const cacheKey = `profile-summary:${req.user.id}`;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const profileSummary = await userController.getProfileSummary(req.user.id);
    // Cache the result for 1 hour, scoped to user token
    await cache.set(cacheKey, profileSummary, 3600, token);
    res.status(200).json({ ...profileSummary, source: 'DB' });
  } catch (error: any) {
    // Fallback to cache
    const cachedData = await cache.get(cacheKey, token);
    if (cachedData) {
      console.log(`[ProfileSummary] DB Failure, serving from cache for user: ${req.user.id}`);
      return res.status(200).json({ ...cachedData, source: 'CACHE' });
    }
    res.status(500).json({ message: error.message });
  }
}

export default withAuth(handler);
