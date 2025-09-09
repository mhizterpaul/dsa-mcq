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

export async function profilePictureHandler(req: NextApiRequest, res: NextApiResponse, prisma: PrismaClient, storageService: StorageService) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const form = formidable({});
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ message: 'Error parsing form data' });
            }

            const profilePicture = files.profilePicture;
            if (!profilePicture || Array.isArray(profilePicture)) {
                return res.status(400).json({ message: 'No profile picture uploaded' });
            }

            try {
                const imageUrl = await storageService.upload(profilePicture, user.id);

                await prisma.user.update({
                    where: { id: user.id },
                    data: { image: imageUrl },
                });

                res.status(200).json({ imageUrl });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error uploading file' });
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const prisma = new PrismaClient();
    const storageService = new StorageService();
    return profilePictureHandler(req, res, prisma, storageService);
}
