import { NextApiRequest, NextApiResponse } from 'next';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { CacheService } from '../../../services/cacheService';
import { verifySignature } from '../../../utils/signature';

export async function loginHandler(req: NextApiRequest, res: NextApiResponse, prisma?: PrismaClient, cache?: CacheService) {
  const client = prisma ?? new PrismaClient();
  const cacheService = cache ?? new CacheService();

  if (!verifySignature(req)) {
    return res.status(403).json({ message: 'Invalid signature' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    let user = cacheService.get(email) as any;

    if (!user) {
      user = await client.user.findUnique({ where: { email } });

      if (user) {
        cacheService.set(email, user);
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.emailVerified === null) {
        return res.status(401).json({ message: 'Email not verified' });
    }

    const passwordMatch = await argon2.verify(user.password, password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ user }, 'your-jwt-secret');
    const refreshToken = jwt.sign({ userId: user.id }, 'your-refresh-secret', { expiresIn: '7d' });

    res.status(200).json({ user, accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return await loginHandler(req, res);
}
