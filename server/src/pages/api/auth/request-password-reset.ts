import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { MailService } from '../../../services/mailService';
import crypto from 'crypto';
import { verifySignature } from '../../../utils/signature';

export async function requestPasswordResetHandler(
    req: NextApiRequest,
    res: NextApiResponse,
    prisma?: PrismaClient,
    mailService?: MailService,
) {
    const client = prisma ?? new PrismaClient();
    const mailer = mailService ?? new MailService(client);

    if (!verifySignature(req)) {
        return res.status(403).json({ message: 'Invalid signature' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await client.user.findUnique({ where: { email } });

        if (!user) {
            // Don't reveal that the user doesn't exist
            return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await client.verificationToken.create({
            data: {
                identifier: user.id,
                token,
                expires,
            },
        });

        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

        await mailer.sendMail({ to: email, subject: 'Password Reset', html: `Click here to reset your password: ${resetLink}` });

        res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient();
    const mailService = new MailService(prisma);
    return await requestPasswordResetHandler(req, res, prisma, mailService);
}
