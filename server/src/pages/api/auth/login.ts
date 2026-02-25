import { NextApiRequest, NextApiResponse } from 'next';
import { prisma as defaultPrisma } from '../../../infra/prisma/client';
import { AuthService } from '../../../controllers/authController';
import { PrismaClient } from '@prisma/client';

export default async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  deps: { prisma: PrismaClient } = { prisma: defaultPrisma }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authService = new AuthService(deps.prisma);
  const { email, password } = req.body;
  const userAgent = req.headers['user-agent'] || '';

  try {
    const { user, token } = await authService.login(email, password, userAgent);
    res.status(200).json({ token, user });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
}