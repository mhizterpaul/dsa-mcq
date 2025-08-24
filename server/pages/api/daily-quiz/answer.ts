import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'POST') {
        const { questionId, answer } = req.body;
        console.log(`Received answer '${answer}' for question '${questionId}'`);
        // In a real app, this would validate the answer, update scores,
        // and trigger an event to be sent to all clients.
        res.status(200).json({ success: true, message: 'Answer received' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
