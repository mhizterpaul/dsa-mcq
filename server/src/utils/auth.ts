import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { CacheService } from '../infra/cacheService';
import { prisma } from '../infra/prisma/client';

export async function validateSession(sessionId: string, userId: string) {
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true }
    });

    if (!session || session.userId !== userId) {
        throw new Error('Session not found or invalid');
    }

    if (session.expires && session.expires < new Date()) {
        throw new Error('Session expired');
    }

    if (!session.user) {
        throw new Error('User not found');
    }

    return session;
}

export async function getAuthenticatedUser(req: NextApiRequest, cache?: CacheService) {
    const cacheService = cache || new CacheService();
    const authHeader = req.headers.authorization;

    if (!authHeader || !/^Bearer /i.test(authHeader)) {
        return null;
    }
    const token = authHeader.split(' ')[1];

    const isBlacklisted = await cacheService.get(token);
    if (isBlacklisted) {
        return null;
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
    } catch (error) {
        return null;
    }

    try {
        const { user, sessionId } = decoded;

        if (!user || !user.id || !sessionId) {
            return null;
        }

        const session = await validateSession(sessionId, user.id);
        return session.user;
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.message.includes('Session') || error.message.includes('User not found')) {
            return null;
        }
        throw error;
    }
}
