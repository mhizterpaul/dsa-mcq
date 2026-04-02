import { PrismaClient } from '@prisma/client';

export const prisma = process.env.NODE_ENV === 'test'
    ? new PrismaClient({
        datasources: { db: { url: "file:./test.db" } },
        log: process.env.PRISMA_LOG === 'true' ? ['query', 'info', 'warn', 'error'] : []
      })
    : new PrismaClient();
