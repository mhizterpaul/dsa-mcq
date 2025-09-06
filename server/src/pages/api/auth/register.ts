import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { verifySignature } from '../../../utils/signature';
import { sendEmail } from '../../../services/mailService';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import cache from '../../../services/cacheService';
import prisma from '../../../db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifySignature(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
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
      const token = await prisma.verificationToken.findUnique({
        where: { token: verificationToken },
      });

      if (!token || token.expires < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      await prisma.user.update({
        where: { id: token.identifier },
        data: { emailVerified: new Date() },
      });

      await prisma.verificationToken.delete({
        where: { token: verificationToken },
      });

      const user = await prisma.user.findUnique({ where: { id: token.identifier } });

      const accessToken = jwt.sign({ user }, 'your-jwt-secret');
      const refreshToken = jwt.sign({ userId: user.id }, 'your-refresh-secret', { expiresIn: '7d' });

      cache.set(user.id, user);

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
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await prisma.verificationToken.create({
        data: {
          identifier: newUser.id,
          token,
          expires,
        },
      });

      await sendEmail(email, 'Verify your email', `Your verification token is: ${token}`);

      res.status(201).json({ message: 'Verification email sent' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
