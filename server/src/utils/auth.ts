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

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
        const { user, sessionId } = decoded;

        if (sessionId) {
            const session = await prisma.session.findFirst({
                where: { id: sessionId, userId: user.id },
            });
            if (!session) {
                return null;
            }
        }

        return user;
    } catch (error) {
        return null;
    }
}