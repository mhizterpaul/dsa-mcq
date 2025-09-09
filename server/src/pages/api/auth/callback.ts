import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { CacheService } from '../../../services/cacheService';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function callbackHandler(req: NextApiRequest, res: NextApiResponse, prisma?: PrismaClient, cache?: CacheService) {
  const client = prisma ?? new PrismaClient();
  const cacheService = cache ?? new CacheService();
  const { code } = req.query;

  if (typeof code !== 'string') {
    return res.status(400).json({ message: 'Invalid code' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email) {
      return res.status(400).json({ message: 'Email not provided by OAuth provider' });
    }

    let user = await client.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await client.user.create({
        data: {
          name: userInfo.name || '',
          email: userInfo.email,
          image: userInfo.picture || null,
          emailVerified: new Date(), // OAuth users are considered verified
        },
      });
    }

    cacheService.set(user.id, user);

    const accessToken = jwt.sign({ user }, 'your-jwt-secret');
    const refreshToken = jwt.sign({ userId: user.id }, 'your-refresh-secret', { expiresIn: '7d' });

    res.status(200).json({ user, accessToken, refreshToken });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return await callbackHandler(req, res);
}
