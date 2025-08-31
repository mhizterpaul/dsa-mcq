import type { NextApiRequest, NextApiResponse } from 'next';

// This should match the Player primitive on the client
interface Player {
    id: string;
    name: string;
    score: number;
    avatar: string;
    level: number;
    highestBadgeIcon: string;
}

const leaderboard: Player[] = [
    { id: '1', name: 'Azunyan U. Wu', score: 118487, avatar: 'https://i.pravatar.cc/150?u=azunyan', level: 80, highestBadgeIcon: 'path/to/badge1.jpg' },
    { id: '2', name: 'Champagne S. Nova', score: 56123, avatar: 'https://i.pravatar.cc/150?u=champagne', level: 55, highestBadgeIcon: 'path/to/badge2.jpg' },
    { id: '3', name: 'The Infiltrator', score: 4878, avatar: 'https://i.pravatar.cc/150?u=infiltrator', level: 12, highestBadgeIcon: 'path/to/badge3.jpg' },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Player[]>
) {
    if (req.method === 'GET') {
        res.status(201).json(leaderboard);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
