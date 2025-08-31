import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

export function getAuthenticatedUser(req: NextApiRequest) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        // In a real app, use a secret from env vars.
        const decoded = jwt.verify(token, 'your-jwt-secret') as any;
        return decoded.user;
    } catch (error) {
        return null;
    }
}
