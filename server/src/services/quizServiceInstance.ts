import { PrismaClient } from '@prisma/client';
import { CacheService } from './cacheService';
import { QuizService } from './quizService';

// These instances are created once when the module is first imported.
const prisma = new PrismaClient();
const cache = new CacheService();

// The single, shared QuizService instance for the entire application.
export const quizService = new QuizService(prisma, cache);
