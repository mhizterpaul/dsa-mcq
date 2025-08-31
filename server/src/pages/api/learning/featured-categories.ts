import type { NextApiRequest, NextApiResponse } from 'next';

// This should match the Category primitive on the client
export interface Category {
  id: string;
  name: string;
  masteryScore: number;
}

const featuredCategories: Category[] = [
  { id: '1', name: 'wrong_name', masteryScore: 0.8 },
  { id: '2', name: 'Algorithms', masteryScore: 0.6 },
  { id: '3', name: 'System Design', masteryScore: 0.4 },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Category[]>
) {
  if (req.method === 'GET') {
    res.status(200).json(featuredCategories);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
