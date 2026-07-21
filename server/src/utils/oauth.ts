import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../infra/prisma/client';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// Exchanges the authorization code and fetches profile info
async function exchangeAndGetProfile(provider: string, code: string, codeVerifier: string, redirectUri: string) {
    // If it's a test or mock code, return mock profile data
    if (process.env.NODE_ENV !== 'production' && (code.startsWith('mock') || !process.env.GOOGLE_CLIENT_SECRET)) {
        return {
            id: `mock-${provider}-id`,
            email: `test-${provider}@example.com`,
            name: `Test ${provider.toUpperCase()} User`,
            picture: '',
            providerAccessToken: `mock-${provider}-token`,
        };
    }

    // Otherwise, do a real OAuth exchange
    let tokenEndpoint = '';
    let userInfoEndpoint = '';
    let clientId = '';
    let clientSecret = '';

    if (provider === 'google') {
        tokenEndpoint = 'https://oauth2.googleapis.com/token';
        userInfoEndpoint = 'https://www.googleapis.com/oauth2/v3/userinfo';
        clientId = process.env.GOOGLE_CLIENT_ID || '';
        clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    } else if (provider === 'github') {
        tokenEndpoint = 'https://github.com/login/oauth/access_token';
        userInfoEndpoint = 'https://api.github.com/user';
        clientId = process.env.GITHUB_CLIENT_ID || '';
        clientSecret = process.env.GITHUB_CLIENT_SECRET || '';
    } else if (provider === 'x') {
        tokenEndpoint = 'https://api.twitter.com/2/oauth2/token';
        userInfoEndpoint = 'https://api.twitter.com/2/users/me';
        clientId = process.env.TWITTER_CLIENT_ID || '';
        clientSecret = process.env.TWITTER_CLIENT_SECRET || '';
    }

    // Exchange code for token
    const body: Record<string, string> = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
    };
    if (codeVerifier) {
        body.code_verifier = codeVerifier;
    }

    const tokenRes = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': provider === 'github' ? 'application/json' : 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body: provider === 'github' ? JSON.stringify(body) : new URLSearchParams(body).toString(),
    });

    if (!tokenRes.ok) {
        throw new Error(`Failed to exchange code: ${await tokenRes.text()}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
        throw new Error('No access token returned from provider');
    }

    // Fetch user info
    const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
    };
    if (provider === 'github') {
        headers['User-Agent'] = 'dsa-mcq-app';
    }

    const userRes = await fetch(userInfoEndpoint, { headers });
    if (!userRes.ok) {
        throw new Error(`Failed to fetch user info: ${await userRes.text()}`);
    }

    const userData = await userRes.json();

    if (provider === 'google') {
        return {
            id: userData.sub,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            providerAccessToken: accessToken,
        };
    } else if (provider === 'github') {
        return {
            id: String(userData.id),
            email: userData.email || `${userData.login}@github.com`,
            name: userData.name || userData.login,
            picture: userData.avatar_url,
            providerAccessToken: accessToken,
        };
    } else if (provider === 'x') {
        // X v2 user endpoint returns { data: { id, name, username } }
        const user = userData.data;
        return {
            id: user.id,
            email: `${user.username}@twitter.com`,
            name: user.name,
            picture: user.profile_image_url || '',
            providerAccessToken: accessToken,
        };
    }

    throw new Error('Unsupported provider');
}

export async function handleOAuthExchange(provider: 'google' | 'github' | 'x', req: NextApiRequest, res: NextApiResponse, prisma?: PrismaClient) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { code, codeVerifier, redirectUri } = req.body;
    if (!code || !redirectUri) {
        return res.status(400).json({ error: 'Code and redirectUri are required' });
    }

    const client = prisma ?? defaultPrisma;

    try {
        const profile = await exchangeAndGetProfile(provider, code, codeVerifier, redirectUri);

        if (!profile.email) {
            return res.status(400).json({ error: 'Email not returned by provider' });
        }

        let user = await client.user.findUnique({
            where: { email: profile.email },
        });

        if (!user) {
            user = await client.user.create({
                data: {
                    name: profile.name,
                    fullName: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    emailVerified: new Date(),
                },
            });
        }

        // Link the provider account if it doesn't exist
        const account = await client.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider,
                    providerAccountId: profile.id,
                },
            },
        });

        if (!account) {
            await client.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider,
                    providerAccountId: profile.id,
                    access_token: profile.providerAccessToken,
                },
            });
        }

        // Create a custom session
        const session = await client.session.create({
            data: {
                userId: user.id,
                userAgent: (req.headers['user-agent'] as string) || '',
                sessionToken: Math.random().toString(36).substring(7),
                expires: new Date(Date.now() + 3600 * 1000 * 24), // 24h
                syncKey: uuidv4(),
            },
        });

        const secret = process.env.JWT_SECRET || 'your-jwt-secret';
        const token = jwt.sign(
            { user, sessionId: session.id },
            secret,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                fullName: user.fullName || user.name,
                email: user.email,
                image: user.image,
            },
            syncKey: session.syncKey,
        });

    } catch (error: any) {
        console.error(`OAuth exchange error for ${provider}:`, error);
        return res.status(500).json({ error: error.message || 'Authentication failed' });
    }
}
