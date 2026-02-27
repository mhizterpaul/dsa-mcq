import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser, validateSession } from './auth';
import { CacheService } from '../infra/cacheService';
import { prisma } from '../infra/prisma/client';
import jwt from 'jsonwebtoken';

export type AuthenticatedRequest = NextApiRequest & {
  user: any;
  sessionId: string;
  syncKey?: string;
};

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => void | Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse, deps?: { cache?: CacheService }) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !/^Bearer /i.test(authHeader)) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token not provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }

    try {
      if (!decoded.user?.id || !decoded.sessionId) {
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      const { user: tokenUser, sessionId } = decoded;

      // Use extracted validation logic
      const session = await validateSession(sessionId, tokenUser.id);

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = session.user;
      authenticatedReq.sessionId = sessionId;
      authenticatedReq.syncKey = session.syncKey || undefined;

      return handler(authenticatedReq, res);
    } catch (error: any) {
      if (error.message === 'Session expired') {
          return res.status(401).json({ message: 'Session expired' });
      }
      if (error.message === 'Session not found or invalid' || error.message === 'User not found') {
          return res.status(401).json({ message: error.message });
      }
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
      }
      if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Invalid token' });
      }

      // Handle database failures specifically if needed, otherwise fall back to 500
      if (error.message === 'Internal Database Error' || (error.code && error.code.startsWith('P'))) {
          return res.status(500).json({ message: 'Internal Server Error' });
      }

      console.error('withAuth error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}
