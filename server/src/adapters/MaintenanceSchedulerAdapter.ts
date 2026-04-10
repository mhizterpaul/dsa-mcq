import { QuizService } from '../controllers/quizController';
import { EngagementService } from '../controllers/engagementController';
import { logger } from '../utils/logger';

export class MaintenanceSchedulerAdapter {
    constructor(
        private quizService: QuizService,
        private engagementService: EngagementService
    ) {}

    async runDailyMaintenance() {
        logger.info('Starting daily maintenance');

        const cleanedCount = await this.quizService.cleanupExpiredSessions();
        if (cleanedCount > 0) {
            logger.info('Cleaned up expired sessions', { count: cleanedCount });
        }

        await this.engagementService.resetWeeklyXP();
        logger.info('Weekly XP reset completed');

        await this.engagementService.resetDailyKingOfQuiz();
        logger.info('Daily King of Quiz reset completed');

        logger.info('Daily maintenance completed');
    }
}
