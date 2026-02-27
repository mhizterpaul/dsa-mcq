import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/withAuth';
import { userController } from '../../../controllers/userController';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const updatedProfile = await userController.updateProfile(req.user.id, req.body);
    res.status(200).json(updatedProfile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export default withAuth(handler);
