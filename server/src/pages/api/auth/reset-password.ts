import { NextApiRequest, NextApiResponse } from 'next';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import { verifySignature } from '../../../utils/signature';

export async function resetPasswordHandler(req: NextApiRequest, res: NextApiResponse, prisma?: PrismaClient) {
    const client = prisma ?? new PrismaClient();

    if (!verifySignature(req)) {
        return res.status(403).json({ message: 'Invalid signature' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
    }

    try {
        const verificationToken = await client.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken || verificationToken.expires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await argon2.hash(password);

        await client.user.update({
            where: { id: verificationToken.identifier },
            data: { password: hashedPassword },
        });

        await client.verificationToken.delete({
            where: { token },
        });

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return await resetPasswordHandler(req, res);
}
