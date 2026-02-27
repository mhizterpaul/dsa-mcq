import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../infra/prisma/client';
import { withAuth, AuthenticatedRequest } from '../../../utils/withAuth';
import { StorageService } from '../../../infra/storageService';

const storageService = new StorageService();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const userId = req.user.id;
  const { file } = req.body;

  if (!file) {
      return res.status(400).json({ message: 'Missing file in request body' });
  }

  try {
    const url = await storageService.upload(file, `profile-pictures/${userId}`);
    await prisma.user.update({
      where: { id: userId },
      data: { image: url },
    });
    res.status(200).json({ url });
  } catch (error: any) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
}

export default withAuth(handler);
