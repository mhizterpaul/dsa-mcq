import { userController } from '../../../controllers/userController';
import { prisma } from '../../../infra/prisma/client';

describe('User Application Service (Controller)', () => {
  const testUserId = 'user-1';

  beforeEach(async () => {
    await prisma.engagement.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: {
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        fullName: 'Test User Full',
        level: 5,
        engagement: {
          create: { xp: 500 }
        }
      }
    });
  });

  afterAll(async () => {
      await prisma.$disconnect();
  });

  test('should return profile summary correctly via service interface', async () => {
    const summary = await userController.getProfileSummary(testUserId);

    expect(summary.user.id).toBe(testUserId);
    expect(summary.user.xp).toBe(500);
    expect(summary.user.level).toBe(5);
  });

  test('should update profile correctly via service interface', async () => {
    const updateData = { fullName: 'Updated Name', email: 'updated@example.com' };
    const result = await userController.updateProfile(testUserId, updateData);

    expect(result.user.fullName).toBe('Updated Name');
    expect(result.user.email).toBe('updated@example.com');

    const dbUser = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(dbUser?.fullName).toBe('Updated Name');
  });

  test('should throw error when user not found', async () => {
    await expect(userController.getProfileSummary('non-existent')).rejects.toThrow('User not found');
  });
});
