import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { CacheService } from '../infra/cacheService';
import { prisma } from '../infra/prisma/client';

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

        if (sessionId) {
            const session = await prisma.session.findFirst({
                where: { id: sessionId, userId: user.id },
                include: { user: true },
            });
            if (!session || !session.user) {
                return null;
            }
            return session.user;
        }

        return user;
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return null;
        }
        throw error;
    }
}