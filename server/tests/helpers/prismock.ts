import { PrismaClient } from '@prisma/client';
import { PrismockClient } from 'prismock';

export const prismock = new PrismockClient() as unknown as PrismaClient;
