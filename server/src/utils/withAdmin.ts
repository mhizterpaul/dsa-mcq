import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from './withAuth';

type AdminApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => void | Promise<void>;

export function withAdmin(handler: AdminApiHandler) {
  return withAuth(async (req, res) => {
    // Assuming the user object has a 'role' property.
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    return handler(req, res);
  });
}