import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'GET') {
        const { sessionId } = req.query;
        // In a real app, this would fetch results for the given session id
        const mockResults = {
            sessionId,
            rank: 3,
            totalParticipants: 15,
            xpEarned: 150,
            badgesUnlocked: [
                { id: 'badge-1', name: 'Quick Thinker' },
            ]
        };
        res.status(200).json(mockResults);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
