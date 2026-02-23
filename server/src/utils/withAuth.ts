import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from './auth';
import { CacheService } from '../infra/cacheService';
import { prisma } from '../infra/prisma/client';
import jwt from 'jsonwebtoken';

export type AuthenticatedRequest = NextApiRequest & {
  user: any;
  sessionId: string;
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
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    try {
      const { user, sessionId } = decoded;

      const session = await prisma.session.findFirst({
        where: { id: sessionId, userId: user.id },
        include: { user: true },
      });

      if (!session || !session.user) {
        return res.status(401).json({ message: 'Session not found or invalid' });
      }

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = session.user;
      authenticatedReq.sessionId = sessionId;

      return handler(authenticatedReq, res);
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}