import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { authorizeRequest } from './auth';
import { CacheService } from '../infra/cacheService';

export type AuthenticatedRequest = NextApiRequest & {
  user: any;
  sessionId: string;
  syncKey?: string;
};

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => void | Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse, deps?: { cache?: CacheService }) => {
    try {
      const authContext = await authorizeRequest(req, deps?.cache);

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = authContext.user;
      authenticatedReq.sessionId = authContext.sessionId;
      authenticatedReq.syncKey = authContext.syncKey;

      return handler(authenticatedReq, res);
    } catch (error: any) {
      if (error.message === 'Database Connection Error' || error.message === 'Internal Database Error' || (error.code && typeof error.code === 'string' && error.code.startsWith('P'))) {
          console.error('withAuth database error:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
      }

      const clientErrors = [
          'Missing or invalid Authorization header',
          'Invalid token',
          'Token expired',
          'Invalid token payload',
          'Session not found or invalid',
          'Session expired',
          'User not found'
      ];

      if (clientErrors.includes(error.message)) {
          return res.status(401).json({ message: error.message });
      }

      // Fallback for any other unexpected errors
      console.error('withAuth unexpected error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}
