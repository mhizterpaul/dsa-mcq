import { PrismaClient } from '@prisma/client';

/**
 * Integration test for Database (Postgres/Supabase/Neon).
 * This test expects a valid DATABASE_URL in the environment.
 */
describe('Database Integration Test', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
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

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
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

    // Cleanup
    await prisma.question.delete({ where: { id: category.questions[0].id } });
    await prisma.category.delete({ where: { id: category.id } });
  });
});
