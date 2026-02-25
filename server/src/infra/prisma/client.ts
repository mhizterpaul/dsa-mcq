import { PrismaClient } from '@prisma/client';
import { PrismockClient } from 'prismock';

export const prisma =
  process.env.NODE_ENV === 'test' && !process.env.USE_REAL_DB
    ? (new PrismockClient() as unknown as PrismaClient)
    : new PrismaClient();
