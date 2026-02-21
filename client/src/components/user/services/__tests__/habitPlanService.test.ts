import { HabitPlanGenerator } from '../habitPlanService';
import { PerformanceGoal, GoalType, UserProfile, PreferredTimeBlock } from '../../store/primitives/UserProfile';

describe('HabitPlanGenerator', () => {
    let mockProfile: UserProfile;
    let mockGoal: PerformanceGoal;
    let mockPreferredBlocks: PreferredTimeBlock[];

    beforeEach(() => {
        mockProfile = new UserProfile('user-1');
        mockProfile.globalRanking = 50;

        mockGoal = {
            type: GoalType.LEADERBOARD_PERCENTILE,
            targetMetric: 10,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        };

        mockPreferredBlocks = [
            { day: 'Monday', start: '18:00', end: '20:00' },
            { day: 'Wednesday', start: '18:00', end: '20:00' }
        ];
    });

    test('toRequiredQuizzes correctly calculates for leaderboard goal', () => {
        const required = HabitPlanGenerator.toRequiredQuizzes(mockGoal, mockProfile);
        // delta = 50 - 10 = 40. (40 / 5) * 15 = 120
        expect(required).toBe(120);
    });

    test('toRequiredQuizzes handles NaN globalRanking', () => {
        mockProfile.globalRanking = NaN;
        const required = HabitPlanGenerator.toRequiredQuizzes(mockGoal, mockProfile);
        // delta = 50 (fallback) - 10 = 40. (40 / 5) * 15 = 120
        expect(required).toBe(120);
    });

    test('validateFeasibility returns false for over-ambitious goals', () => {
        const requiredQuizzes = 200;
        const deadline = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days from now
        // Capacity = 10 * 2 = 20 sessions
        const result = HabitPlanGenerator.validateFeasibility(requiredQuizzes, deadline);
        expect(result.feasible).toBe(false);
        expect(result.message).toContain('Goal is too ambitious');
    });

    test('generateSchedule produces a valid QuizSchedule', () => {
        // Use a more feasible goal for testing
        mockGoal.targetMetric = 40; // delta = 10, required = 30
        const schedule = HabitPlanGenerator.generateSchedule(mockGoal, mockPreferredBlocks, mockProfile);

        expect(schedule.sessions.length).toBe(30);
        expect(schedule.sessions[0]).toHaveProperty('date');
        expect(schedule.sessions[0]).toHaveProperty('time');
        expect(schedule.sessions[0]).toHaveProperty('difficulty');
    });

    test('findBestBlock uses midpoint strategy', () => {
        const timeBlock: PreferredTimeBlock = { day: 'Monday', start: '10:00', end: '12:00' };
        const result = HabitPlanGenerator.findBestBlock('2023-10-02', [timeBlock]); // Oct 2, 2023 is Monday
        expect(result.time).toBe('11:00');
    });
});
