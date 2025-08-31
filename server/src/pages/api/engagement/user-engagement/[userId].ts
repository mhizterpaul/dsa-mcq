import type { NextApiRequest, NextApiResponse } from 'next';

// This should match the UserEngagement primitive on the client
// For simplicity, we define a subset here.
interface UserEngagement {
    userId: string;
    unlockedAchievementIds: string[];
    // other fields...
}

const userEngagementData: { [key: string]: UserEngagement } = {
    'user-123': {
        userId: 'user-123',
        unlockedAchievementIds: ['1', '3'],
    }
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserEngagement | { error: string }>
) {
    const { userId } = req.query;

    if (req.method === 'GET') {
        if (typeof userId === 'string' && userEngagementData[userId]) {
            res.status(200).json(userEngagementData[userId]);
        } else {
            res.status(400).json({ error: 'User engagement data not found.' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
