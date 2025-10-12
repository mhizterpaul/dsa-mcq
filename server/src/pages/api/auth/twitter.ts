import { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '../../../services/cacheService';

const prisma = new PrismaClient();
const cache = new CacheService();

if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
  throw new Error("TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET must be set");
}

const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

const CALLBACK_URL = 'http://localhost:3000/api/auth/twitter';

// In-memory store for demo purposes. In a real app, use a session or a database.
const tempStore: { [key: string]: { codeVerifier: string; state: string } } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.code) {
    // Handle callback
    const { code, state } = req.query;
    const stored = tempStore[state as string];

    if (!stored || !code || typeof code !== 'string' || !state) {
      return res.status(400).json({ error: 'Invalid request or state mismatch' });
    }

    const { codeVerifier } = stored;
    delete tempStore[state as string];

    try {
      const { client: loggedClient, accessToken, refreshToken } = await twitterClient.loginWithOAuth2({
        code,
        codeVerifier,
        redirectUri: CALLBACK_URL,
      });

      const { data: userObject } = await loggedClient.v2.me({ "user.fields": ["profile_image_url"] });
      const email = `${userObject.username}@twitter.com`; // Create a fake email

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: userObject.name,
            email: email,
            image: userObject.profile_image_url,
            emailVerified: new Date(),
          },
        });
      }

      const sessionToken = `mock-session-token-for-${user.id}-${Date.now()}`;

      const deepLink = `com.dsamcq://auth/callback?token=${sessionToken}&user=${encodeURIComponent(JSON.stringify(user))}`;
      res.redirect(deepLink);


    } catch (error) {
      console.error('Twitter OAuth Error:', error);
      res.status(500).json({ error: 'Failed to authenticate with Twitter' });
    }
  } else {
    // Initiate login
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(CALLBACK_URL, {
      scope: ['tweet.read', 'users.read', 'offline.access'],
    });

    tempStore[state] = { codeVerifier, state };

    res.redirect(url);
  }
}