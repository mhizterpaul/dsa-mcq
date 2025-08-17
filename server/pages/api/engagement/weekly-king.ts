import type { NextApiRequest, NextApiResponse } from 'next';

// This should match a primitive on the client, e.g., in engagement store
export interface WeeklyKing {
  userId: string;
  name: string;
  score: number;
  avatarUrl?: string;
}

const weeklyKing: WeeklyKing = {
  userId: 'user-123',
  name: 'Asiq Mohammed', // From the mockup
  score: 10000,
  avatarUrl: 'https://i.pravatar.cc/150?u=asiq',
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeeklyKing>
) {
  if (req.method === 'GET') {
    res.status(200).json(weeklyKing);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
