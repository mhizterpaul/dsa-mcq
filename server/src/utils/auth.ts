import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { CacheService } from '../infra/cacheService';
import { prisma } from '../infra/prisma/client';

export interface AuthContext {
    userId: string;
    sessionId: string;
    role: string;
    user: any;
    syncKey?: string;
}

export async function validateSession(sessionId: string, userId: string) {
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true }
    }).catch(err => {
        console.error('validateSession error:', err);
        throw new Error('Internal Database Error');
    });

    if (!session) {
        if (process.env.NODE_ENV === 'test') console.log('Auth Failure: Session not found in DB', { sessionId });
        throw new Error('Session not found or invalid');
    }

    const sUserId = String(session.userId).trim();
    const pUserId = String(userId).trim();
    if (sUserId !== pUserId) {
        if (process.env.NODE_ENV === 'test') {
            console.log('Auth Failure: Session userId mismatch', {
                sessionUserId: sUserId,
                payloadUserId: pUserId
            });
        }
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

export async function authorizeRequest(req: NextApiRequest, cache?: CacheService): Promise<AuthContext> {
    const cacheService = cache || new CacheService();
    const authHeader = req.headers.authorization;

    if (!authHeader || !/^Bearer /i.test(authHeader)) {
        throw new Error('Missing or invalid Authorization header');
    }
    const token = authHeader.split(' ')[1];

    const isBlacklisted = await cacheService.get(token);
    if (isBlacklisted) {
        throw new Error('Invalid token');
    }

    let decoded: any;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        }
        throw new Error('Invalid token');
    }

    const userId = decoded.sub ||
                   (decoded.user && typeof decoded.user === 'object' ? decoded.user.id : decoded.user) ||
                   decoded.id;
    const sessionId = decoded.sessionId;

    if (!userId || !sessionId) {
        if (process.env.NODE_ENV === 'test') console.log('Auth Failure: Missing userId or sessionId in payload', { userId, sessionId, decoded });
        throw new Error('Invalid token payload');
    }

    // Capture potential database errors explicitly
    const session = await validateSession(sessionId, userId);

    return {
        userId: session.user.id,
        sessionId: session.id,
        role: session.user.role,
        user: session.user,
        syncKey: session.syncKey || undefined
    };
}

export async function getAuthenticatedUser(req: NextApiRequest, cache?: CacheService) {
    try {
        const context = await authorizeRequest(req, cache);
        return context.user;
    } catch (error) {
        return null;
    }
}
