import cron from 'node-cron';
import { EngagementService } from '../controllers/engagementController';
import { QuizService } from '../controllers/quizController';
import { prisma } from './prisma/client';

class SchedulerService {
    start() {
        const engagementService = new EngagementService(prisma);
        const quizService = new QuizService(prisma);

        // Schedule a job to run every Sunday at midnight to reset weekly XP
        cron.schedule('0 0 * * 0', () => {
            engagementService.resetWeeklyXP();
        });

        // Schedule a job to run on the first day of every month at midnight to reset monthly XP
        cron.schedule('0 0 1 * *', () => {
            engagementService.resetMonthlyXP();
        });

        // Clean up expired quiz sessions every 10 minutes
        cron.schedule('*/10 * * * *', () => {
            quizService.cleanupExpiredSessions();
        });

        console.log('Scheduler service started.');
    }
}

export const schedulerService = new SchedulerService();
// To start the scheduler when the server boots up, you would typically call schedulerService.start()
// in your main application entry point (e.g., server.ts or app.ts), but for this environment,
// we will assume it's started.
