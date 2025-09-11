import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../utils/auth';
import { StorageService } from '../../../services/storageService';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';

export const config = {
    api: {
        bodyParser: false,
    },
};

export function profilePictureHandler(req: NextApiRequest, res: NextApiResponse, prisma: PrismaClient, storageService: StorageService): Promise<void> {
    return new Promise((resolve) => {
        const user = getAuthenticatedUser(req);
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return resolve();
        }

        if (req.method === 'POST') {
            const form = formidable({});
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    res.status(500).json({ message: 'Error parsing form data' });
                    return resolve();
                }

                const profilePicture = files.profilePicture;
                if (!profilePicture || !Array.isArray(profilePicture) || profilePicture.length === 0) {
                    res.status(400).json({ message: 'No profile picture uploaded' });
                    return resolve();
                }

                try {
                    const imageUrl = await storageService.upload(profilePicture[0], 'profile-pictures');

                    await prisma.user.update({
                        where: { id: user.id },
                        data: { image: imageUrl },
                    });

                    res.status(200).json({ imageUrl });
                    resolve();
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Error uploading file' });
                    resolve();
                }
            });
        } else {
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
            resolve();
        }
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const prisma = new PrismaClient();
    const storageService = new StorageService();
    return profilePictureHandler(req, res, prisma, storageService);
}
