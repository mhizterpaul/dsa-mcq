import { getPrismaClient } from '../infra/prisma/client';
import { QuizService } from './quizService';

const prisma = getPrismaClient();
export const quizService = new QuizService(prisma);