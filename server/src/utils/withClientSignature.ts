import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { verifySignature } from './signature';
import { AuthenticatedRequest } from './withAuth';

export function withClientSignature(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.syncKey) {
        return res.status(403).json({ message: 'Sync key not found for session' });
    }
    if (!verifySignature(req, authReq.syncKey)) {
      return res.status(403).json({ message: 'Invalid client signature' });
    }
    return handler(req, res);
  };
}
