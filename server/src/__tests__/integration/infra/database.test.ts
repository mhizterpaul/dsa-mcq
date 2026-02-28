import { PrismaClient } from '@prisma/client';
import { ensureIntegrationTestEnv } from '../setup';

/**
 * Integration test for Database (Postgres/Supabase/Neon).
 * This test expects a valid DATABASE_URL in the environment.
 */
describe('Database Integration Test', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    ensureIntegrationTestEnv();
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    // Global cleanup if necessary
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Reset DB state between tests for isolation
    // In a real Postgres environment, we might use TRUNCATE or a test schema
    await prisma.quizParticipant.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.quizSession.deleteMany();
    await prisma.userQuestionData.deleteMany();
    await prisma.media.deleteMany();
    await prisma.engagement.deleteMany();
    await prisma.leaderboard.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    await prisma.question.deleteMany();
    await prisma.category.deleteMany();
  });

  it('should create and retrieve a user with engagement data', async () => {
    const email = `test-${Date.now()}@example.com`;

    // Create User
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Integration Test User',
        engagement: {
          create: {
            xp: 100,
            xp_weekly: 50,
          },
        },
      },
      include: {
        engagement: true,
      },
    });

    expect(user.email).toBe(email);
    expect(user.engagement).toBeDefined();
    expect(user.engagement?.xp).toBe(100);

    // Retrieve User
    const retrievedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { engagement: true },
    });

    expect(retrievedUser?.id).toBe(user.id);
    expect(retrievedUser?.engagement?.xp).toBe(100);
  });

  it('should handle relationships between Category and Question', async () => {
    const categoryName = `Category-${Date.now()}`;

    // Create Category and Question
    const category = await prisma.category.create({
      data: {
        name: categoryName,
        questions: {
          create: {
            title: 'Test Question',
            body: 'Is this a test?',
            difficulty: 'EASY',
            a: 'Yes',
            b: 'No',
            c: 'Maybe',
            d: 'None',
            correct: 'a',
          },
        },
      },
      include: {
        questions: true,
      },
    });

    expect(category.questions.length).toBe(1);
    expect(category.questions[0].title).toBe('Test Question');
  });

  it('should enforce unique constraint on user email', async () => {
    const email = 'duplicate@example.com';
    await prisma.user.create({ data: { email, name: 'User 1' } });

    await expect(prisma.user.create({ data: { email, name: 'User 2' } }))
      .rejects.toThrow();
  });

  it('should enforce foreign key constraints', async () => {
    // Attempt to create a question with non-existent category
    await expect(prisma.question.create({
      data: {
        title: 'Orphan',
        body: 'No category',
        difficulty: 'EASY',
        categoryId: 'non-existent-id',
        a: '1', b: '2', c: '3', d: '4', correct: 'a'
      }
    })).rejects.toThrow();
  });

  it('should handle concurrent user creation with same email', async () => {
    const email = 'concurrent@example.com';

    // Try to create the same user in parallel
    const results = await Promise.allSettled([
        prisma.user.create({ data: { email, name: 'User A' } }),
        prisma.user.create({ data: { email, name: 'User B' } }),
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
  });

  it('should enforce non-null constraints', async () => {
    // @ts-ignore - testing runtime error
    await expect(prisma.category.create({ data: { name: null } }))
      .rejects.toThrow();
  });
});
