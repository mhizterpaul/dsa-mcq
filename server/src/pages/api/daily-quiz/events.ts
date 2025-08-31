import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        let eventCount = 0;
        const intervalId = setInterval(() => {
            eventCount++;
            const eventData = {
                type: 'question',
                question: { id: eventCount, text: `This is question number ${eventCount}` }
            };
            res.write(`data: ${JSON.stringify(eventData)}\n\n`);

            if (eventCount >= 5) { // Send 5 mock events then close
                clearInterval(intervalId);
                res.end();
            }
        }, 2000);

        req.on('close', () => {
            clearInterval(intervalId);
            res.end();
        });
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
