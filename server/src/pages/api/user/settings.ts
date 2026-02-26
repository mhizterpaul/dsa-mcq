import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/auth';
import { prisma } from '../../../infra/prisma/client';

export async function settingsHandler(req: NextApiRequest, res: NextApiResponse) {
    let user;
    try {
        user = await getAuthenticatedUser(req);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const { quizTitle } = req.body;
        if (typeof quizTitle !== 'string') {
            return res.status(400).json({ message: 'Invalid quizTitle' });
        }

        // Implementation for updating user settings
        console.log('Updating user settings:', { userId: user.id, quizTitle });
        res.status(200).json({ success: true });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    return settingsHandler(req, res);
}
