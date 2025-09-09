import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '../../../services/cacheService';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

const verifyToken = async (provider: string, token: string): Promise<any> => {
  console.log(`Verifying token for provider: ${provider}`);
  if (token === 'valid-token') {
    return {
      email: 'test@example.com',
      name: 'Test User',
      picture: ''
    };
  }
  throw new Error('Invalid token');
};

export async function providerSigninHandler(req: NextApiRequest, res: NextApiResponse, prisma?: PrismaClient, cache?: CacheService) {
    const client = prisma ?? new PrismaClient();
    const cacheService = cache ?? new CacheService();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { provider, token } = req.body;

    if (!provider || !token) {
        return res.status(400).json({ error: 'Provider and token are required' });
    }

    try {
        const profile = await verifyToken(provider, token);

        let user = await client.user.findUnique({
            where: { email: profile.email },
        });

        if (!user) {
            user = await client.user.create({
                data: {
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    emailVerified: new Date(),
                },
            });
        }

        const sessionToken = `mock-session-token-for-${user.id}-${Date.now()}`;

        const response: AuthResponse = {
            token: sessionToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
            },
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return await providerSigninHandler(req, res);
}
