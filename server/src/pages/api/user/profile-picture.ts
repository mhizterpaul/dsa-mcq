import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../infra/prisma/client';
import { withAuth } from '../../../utils/withAuth';
import { StorageService } from '../../../services/storageService';

const storageService = new StorageService();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // @ts-ignore
    const userId = req.user.id;
    const { file } = req.body;

    try {
      const url = await storageService.upload(file, `profile-pictures/${userId}`);
      await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: url },
      });
      res.status(200).json({ url });
    } catch (error: any) {
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);