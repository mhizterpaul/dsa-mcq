import { PrismaClient } from '@prisma/client';

export class QuizService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getQuestions(categoryId: string, difficulty: string) {
    return this.prisma.question.findMany({
      where: {
        categoryId,
        difficulty,
      },
    });
  }
}