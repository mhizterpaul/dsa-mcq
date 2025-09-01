import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../utils/auth';
import { verifySignature } from '../../utils/signature';
import prisma from '../../db/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (!verifySignature(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const clientDirtyData = req.body;
        const syncedData: { [tableName: string]: any[] } = {};

        try {
            for (const tableName in clientDirtyData) {
                const clientRecords = clientDirtyData[tableName];

                if (tableName === 'Engagement') {
                    for (const record of clientRecords) {
                        // Basic security check
                        if (record.userId !== user.id) {
                            continue;
                        }
                        await prisma.engagement.upsert({
                            where: { userId: record.userId },
                            update: { xp: record.xp },
                            create: { userId: record.userId, xp: record.xp },
                        });
                    }
                    syncedData[tableName] = await prisma.engagement.findMany({ where: { userId: user.id } });
                }
                // ... handle other tables
            }

            res.status(200).json(syncedData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
