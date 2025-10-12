import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { verifySignature } from './signature';

export function withClientSignature(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!verifySignature(req)) {
      return res.status(403).json({ message: 'Invalid client signature' });
    }
    return handler(req, res);
  };
}