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
    });

    if (!session) {
        throw new Error('Session not found or invalid');
    }

    if (session.userId !== userId) {
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

    const userId = decoded.sub || decoded.user?.id;
    const sessionId = decoded.sessionId;

    if (!userId || !sessionId) {
        throw new Error('Invalid token payload');
    }

    // Capture potential database errors explicitly
    let session;
    try {
        session = await validateSession(sessionId, userId);
    } catch (error: any) {
        // If it's one of our expected validation errors, re-throw it
        if (['Session not found or invalid', 'Session expired', 'User not found'].includes(error.message)) {
            throw error;
        }
        // Otherwise, it's likely a database connection error or similar
        throw new Error('Internal Database Error');
    }

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
