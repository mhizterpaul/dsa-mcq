import type { NextApiRequest, NextApiResponse } from 'next';

// This should match the Achievement primitive on the client
interface Achievement {
    id: string;
    name: string;
    description: string;
    unlockCriteria: string;
    imagePath: string;
}

const allAchievements: Achievement[] = [
    { id: '1', name: 'Fitness God', description: 'Achieve the highest rank in fitness quizzes.', unlockCriteria: 'Reach level 100 in Fitness.', imagePath: 'client/src/engagement/components/mockup/original-6b0784cb19d1d688a7a939d8d3dd637f.jpg' },
    { id: '2', name: 'AI Enthusiast', description: 'Master the AI category.', unlockCriteria: 'Answer 50 AI questions correctly.', imagePath: 'client/src/engagement/components/mockup/original-8bf8b040d429a7eae1f920adc3433a8f.jpg' },
    { id: '3', name: 'Max Sets', description: 'Complete 100 quiz sessions.', unlockCriteria: 'Participate in 100 quiz sessions.', imagePath: 'client/src/engagement/components/mockup/original-af5e61cf6a92f060da2c694cce4c4786.jpg' },
    { id: '4', name: '80 Day Streak', description: 'Maintain a streak for 80 days.', unlockCriteria: 'Log in and play a quiz for 80 consecutive days.', imagePath: 'client/src/engagement/components/mockup/original-d4a9845ef5ffa9f933d21a2ae9d1e48e.jpg' },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Achievement[]>
) {
    if (req.method === 'GET') {
        res.status(200).json(allAchievements);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
