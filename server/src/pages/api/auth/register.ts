import { NextApiRequest, NextApiResponse } from 'next';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import { MailService } from '../../../services/mailService';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { CacheService } from '../../../services/cacheService';
import { verifySignature } from '../../../utils/signature';

export async function registerHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  prisma?: PrismaClient,
  cache?: CacheService,
  mailService?: MailService,
) {
  const client = prisma ?? new PrismaClient();
  const cacheService = cache ?? new CacheService();
  const mailer = mailService ?? new MailService(client);

  if (!verifySignature(req)) {
    return res.status(403).json({ message: 'Invalid signature' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (req.query.verify === 'email') {
    // Handle email verification
    const { verificationToken } = req.body;
    if (!verificationToken) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    try {
      const token = await client.verificationToken.findUnique({
        where: { token: verificationToken },
      });

      if (!token || token.expires < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      await client.user.update({
        where: { id: token.identifier },
        data: { emailVerified: new Date() },
      });

      await client.verificationToken.delete({
        where: { token: verificationToken },
      });

      const user = await client.user.findUnique({ where: { id: token.identifier } });

      const accessToken = jwt.sign({ user }, 'your-jwt-secret');
      const refreshToken = jwt.sign({ userId: user.id }, 'your-refresh-secret', { expiresIn: '7d' });

      cacheService.set(user.id, user);

      return res.status(200).json({ user, accessToken, refreshToken });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

  } else {
    // Handle initial registration
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const existingUser = await client.user.findUnique({ where: { email } });

      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const hashedPassword = await argon2.hash(password);

      const newUser = await client.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await client.verificationToken.create({
        data: {
          identifier: newUser.id,
          token,
          expires,
        },
      });

      await mailer.sendMail({ to: email, subject: 'Verify your email', html: `Your verification token is: ${token}` });

      res.status(201).json({ message: 'Verification email sent' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const prisma = new PrismaClient();
  const cacheService = new CacheService();
  const mailService = new MailService(prisma);
  return await registerHandler(req, res, prisma, cacheService, mailService);
}
