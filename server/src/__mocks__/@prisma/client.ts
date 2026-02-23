const actual = jest.requireActual('@prisma/client');

let PrismaClient;

if (process.env.USE_REAL_DB) {
    PrismaClient = actual.PrismaClient;
} else {
    const mPrisma = {
      $disconnect: jest.fn(),
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        createMany: jest.fn(),
        deleteMany: jest.fn(),
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

    PrismaClient = jest.fn(() => mPrisma);
}

export { PrismaClient };
export default { PrismaClient };
