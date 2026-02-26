import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from './auth';
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

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;

      // Enforce payload structure
      if (!decoded.user?.id || !decoded.sessionId) {
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      const { user: tokenUser, sessionId } = decoded;

      // Re-fetch session AND user from DB to ensure they are still valid and have correct roles
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true }
      });

      if (!session || session.userId !== tokenUser.id) {
        return res.status(401).json({ message: 'Session not found or invalid' });
      }

      if (session.expires && session.expires < new Date()) {
        return res.status(401).json({ message: 'Session expired' });
      }

      if (!session.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = session.user;
      authenticatedReq.sessionId = sessionId;
      authenticatedReq.syncKey = session.syncKey || undefined;

      return handler(authenticatedReq, res);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}
