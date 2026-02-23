import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/withAuth';
import { AuthService } from '../../../controllers/authController';
import { prisma as defaultPrisma } from '../../../infra/prisma/client';
import { PrismaClient } from '@prisma/client';

export async function rawLogoutHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  deps: { prisma: PrismaClient } = { prisma: defaultPrisma }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authService = new AuthService(deps.prisma);
  const { sessionId } = req;

  if (!sessionId) {
    return res.status(401).json({ message: 'Unauthorized: No session ID provided.' });
  }

  try {
    await authService.logout(sessionId);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
}

export default withAuth(rawLogoutHandler);