import { getPrismaClient } from '../infra/prisma/client';
import { EngagementService } from './engagementService';

const prisma = getPrismaClient();
export const engagementService = new EngagementService(prisma);