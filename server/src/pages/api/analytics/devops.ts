import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

export async function devopsHandler(req: NextApiRequest, res: NextApiResponse, prisma: PrismaClient) {
  if (req.method === 'GET') {
    const metrics = await prisma.devOpsMetric.findMany();
    res.status(200).json(metrics);
  } else if (req.method === 'POST') {
    const { type, payload } = req.body;
    const newMetric = await prisma.devOpsMetric.create({
      data: {
        type,
        payload: JSON.stringify(payload),
      },
    });
    res.status(201).json(newMetric);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();
  return devopsHandler(req, res, prisma);
}
