import {
    PerformanceGoal,
    GoalType,
    PreferredTimeBlock,
    QuizSchedule,
    QuizSession,
    UserProfile
} from '../store/primitives/UserProfile';

export class HabitPlanGenerator {

    static toRequiredQuizzes(goal: PerformanceGoal, profile: UserProfile): number {
        switch (goal.type) {
            case GoalType.LEADERBOARD_PERCENTILE:
                // Current percentile is hypothetical, using a default or derived value if available
                const currentPercentile = (isNaN(profile.globalRanking) || !profile.globalRanking) ? 50 : profile.globalRanking;
                const targetPercentile = typeof goal.targetMetric === 'number' ? goal.targetMetric : 10;
                const delta = currentPercentile - targetPercentile;
                if (delta <= 0) return 5; // Maintenance
                // each 15 quizzes improves ~5 percentile
                return Math.ceil((delta / 5) * 15);

            case GoalType.INTUITION_GAIN:
                // Target number of medium/hard problems
                return typeof goal.targetMetric === 'number' ? goal.targetMetric : 100;

            case GoalType.INTERVIEW_PREP:
                // Mock interviews and timed contests
                return 60; // Defaulting to a standard prep cycle

            case GoalType.COURSE_PASS:
                // Chapters x Quizzes
                return 80;

            case GoalType.COMPETITIVE_PROGRAMMING:
                return 120;

            default:
                return 50;
        }
    }

    static validateFeasibility(requiredQuizzes: number, deadline: string): { feasible: boolean; message?: string } {
        const today = new Date();
        const targetDate = new Date(deadline);
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return { feasible: false, message: 'Deadline has already passed' };

        const maxSessionsPerDay = 2;
        const totalCapacity = diffDays * maxSessionsPerDay;

        if (requiredQuizzes > totalCapacity) {
            return {
                feasible: false,
                message: `Goal is too ambitious. Requires ${requiredQuizzes} quizzes but capacity is ${totalCapacity} in ${diffDays} days.`
            };
        }

        return { feasible: true };
    }

    static generateSpacedDates(requiredQuizzes: number, deadline: string): string[] {
        const today = new Date();
        const targetDate = new Date(deadline);
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const urgencyFactor = requiredQuizzes / diffDays;
        const dates: string[] = [];

        // Simple distribution for now, compressed if urgency is high
        for (let i = 0; i < requiredQuizzes; i++) {
            const dayOffset = Math.floor((i / requiredQuizzes) * diffDays);
            const date = new Date(today);
            date.setDate(today.getDate() + dayOffset);
            dates.push(date.toISOString().split('T')[0]);
        }

        return dates;
    }

    static findBestBlock(dateStr: string, preferredBlocks: PreferredTimeBlock[]): { time: string } {
        const date = new Date(dateStr);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[date.getDay()];

        let block = preferredBlocks.find(b => b.day === dayName);

        if (!block && preferredBlocks.length > 0) {
            // If no block on this day, use the first available preferred time as default
            block = preferredBlocks[0];
        }

        if (block) {
            // Midpoint strategy
            const [hStart, mStart] = block.start.split(':').map(Number);
            const [hEnd, mEnd] = block.end.split(':').map(Number);

            const startMinutes = hStart * 60 + mStart;
            const endMinutes = hEnd * 60 + mEnd;
            const midMinutes = startMinutes + (endMinutes - startMinutes) / 2;

            const hMid = Math.floor(midMinutes / 60);
            const mMid = Math.floor(midMinutes % 60);

            return { time: `${hMid.toString().padStart(2, '0')}:${mMid.toString().padStart(2, '0')}` };
        }

        return { time: '19:00' }; // Default fallback
    }

    static generateSchedule(
        goal: PerformanceGoal,
        preferredBlocks: PreferredTimeBlock[],
        profile: UserProfile
    ): QuizSchedule {
        const requiredQuizzes = this.toRequiredQuizzes(goal, profile);
        const feasibility = this.validateFeasibility(requiredQuizzes, goal.deadline);

        if (!feasibility.feasible) {
            throw new Error(feasibility.message);
        }

        const spacedDates = this.generateSpacedDates(requiredQuizzes, goal.deadline);
        const sessions: QuizSession[] = spacedDates.map((date, index) => {
            const { time } = this.findBestBlock(date, preferredBlocks);

            // Difficulty Progression Engine
            let difficulty = 'Medium';
            const progress = index / requiredQuizzes;
            if (progress < 0.3) difficulty = 'Easy';
            else if (progress > 0.7) difficulty = 'Hard';

            return {
                date,
                time,
                difficulty,
                topic: 'General DSA' // Could be randomized or based on weak topics
            };
        });

        return { sessions };
    }
}
