import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'GET') {
        // In a real implementation, this would fetch session data from the DB
        const mockSession = {
            sessionId: 'daily-quiz-123',
            participantCount: 15,
            participants: [
                { userId: '1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
                { userId: '2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
                { userId: '3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=charlie' },
            ]
        };
        res.status(201).json(mockSession);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
