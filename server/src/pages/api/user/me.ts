import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../utils/withAuth';

function meHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // The user object is attached to the request by the withAuth middleware
  const user = req.user;
  // @ts-ignore
  delete user.password;
  res.status(200).json(user);
}

export default withAuth(meHandler);