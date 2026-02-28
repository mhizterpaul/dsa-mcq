import { PrismaClient } from '@prisma/client';
import { ensureIntegrationTestEnv } from '../setup';
import { v4 as uuidv4 } from 'uuid';

/**
 * Integration test for Database (Postgres/Supabase/Neon).
 */
describe('Database Integration Test', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    ensureIntegrationTestEnv();
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Robust cleanup: Reset tables in correct order or use a transaction
    // For this environment, we'll continue with deleteMany but in a safer order
    const deleteOrder = [
        prisma.quizParticipant.deleteMany(),
        prisma.quizQuestion.deleteMany(),
        prisma.quizSession.deleteMany(),
        prisma.userQuestionData.deleteMany(),
        prisma.media.deleteMany(),
        prisma.engagement.deleteMany(),
        prisma.leaderboard.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.session.deleteMany(),
        prisma.account.deleteMany(),
        prisma.user.deleteMany(),
        prisma.tagOnQuestion.deleteMany(),
        prisma.tag.deleteMany(),
        prisma.question.deleteMany(),
        prisma.category.deleteMany(),
    ];

    for (const task of deleteOrder) {
        await task;
    }
  });

  it('should create and retrieve a user with engagement data', async () => {
    const email = `test-${uuidv4()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Integration Test User',
        engagement: { create: { xp: 100 } },
      },
      include: { engagement: true },
    });

    expect(user.email).toBe(email);
    expect(user.engagement?.xp).toBe(100);
  });

  it('should handle transactional rollback', async () => {
      const email = `rollback-${uuidv4()}@example.com`;

      try {
          await prisma.$transaction(async (tx) => {
              await tx.user.create({ data: { email, name: 'Rollback User' } });
              // Force failure
              throw new Error('Forced failure');
          });
      } catch (e) {
          // Expected
      }

      const user = await prisma.user.findUnique({ where: { email } });
      expect(user).toBeNull();
  });

  it('should handle bulk operations', async () => {
      const usersData = Array.from({ length: 5 }, (_, i) => ({
          email: `bulk-${i}-${uuidv4()}@example.com`,
          name: `Bulk User ${i}`,
      }));

      await prisma.user.createMany({ data: usersData });
      const count = await prisma.user.count({ where: { email: { contains: 'bulk-' } } });
      expect(count).toBe(5);
  });

  it('should enforce unique and foreign key constraints', async () => {
    const email = `unique-${uuidv4()}@example.com`;
    await prisma.user.create({ data: { email, name: 'User 1' } });
    await expect(prisma.user.create({ data: { email, name: 'User 2' } })).rejects.toThrow();

    await expect(prisma.question.create({
      data: {
        title: 'Orphan', body: 'No category', difficulty: 'EASY', categoryId: 'non-existent',
        a: '1', b: '2', c: '3', d: '4', correct: 'a'
      }
    })).rejects.toThrow();
  });
});
