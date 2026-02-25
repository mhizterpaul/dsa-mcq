import { PrismaClient } from '@prisma/client';

<<<<<<< HEAD
export const prisma =
  process.env.NODE_ENV === 'test' && !process.env.USE_REAL_DB
    ? (new PrismockClient() as unknown as PrismaClient)
    : new PrismaClient();
=======
export const prisma = new PrismaClient();
>>>>>>> analytics-dashboard-v2-5051008972193503984
