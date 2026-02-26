import { prisma } from '../infra/prisma/client';

export const userController = {
  async getProfileSummary(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        engagement: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user.id,
        fullName: user.fullName || user.name,
        email: user.email,
        image: user.image,
        level: user.level,
        achievementsCount: user.achievementsCount,
        weeklyGiftsCount: user.weeklyGiftsCount,
        xp: user.engagement?.xp || 0,
        preferences: user.preferences ? JSON.parse(user.preferences) : null,
        metadata: user.metadata ? JSON.parse(user.metadata) : null,
      },
    };
  },

  async updateProfile(userId: string, data: any) {
    const { fullName, preferences, metadata } = data;

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (preferences !== undefined) updateData.preferences = JSON.stringify(preferences);
    if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        preferences: updatedUser.preferences ? JSON.parse(updatedUser.preferences) : null,
        metadata: updatedUser.metadata ? JSON.parse(updatedUser.metadata) : null,
      },
    };
  },
};
