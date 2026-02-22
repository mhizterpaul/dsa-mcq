import { NextApiRequest, NextApiResponse } from 'next';
import { prisma as defaultPrisma } from '../../../infra/prisma/client';
import { AuthService } from '../../../controllers/authController';
import { PrismaClient } from '@prisma/client';

export default async function registerHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  deps: { prisma: PrismaClient } = { prisma: defaultPrisma }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authService = new AuthService(deps.prisma);
  const { email, password, name, fullName } = req.body;
  const userAgent = req.headers['user-agent'] || '';

  try {
    const { user, token } = await authService.register({
      email,
      password,
      name: name || fullName,
      userAgent,
    });
    res.status(201).json({ user, token });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}