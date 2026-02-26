import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/withAuth';
import { userController } from '../../../controllers/userController';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const profileSummary = await userController.getProfileSummary(req.user.id);
    res.status(200).json(profileSummary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export default withAuth(handler);
