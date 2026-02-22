const mPrisma = {
  $disconnect: jest.fn(),
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  verificationToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  devOpsMetric: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

export const PrismaClient = jest.fn(() => mPrisma);
export default { PrismaClient };
