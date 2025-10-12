import { PrismaClient } from '@prisma/client';
import { PrismockClient } from 'prismock';

export const prisma =
  process.env.NODE_ENV === 'test'
    ? (new PrismockClient() as unknown as PrismaClient)
    : new PrismaClient();