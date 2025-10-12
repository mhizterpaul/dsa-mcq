export interface DailyQuiz {
    title: string;
    description: string;
    quizId: string;
}

export interface Player {
    id: string;
    name: string;
    score: number;
    avatar: string;
    level: number;
    highestBadgeIcon: string;
}

export interface KingOfQuiz {
    name: string;
    avatar: string;
    score: number;
}

export interface GlobalEngagement {
    dailyQuiz: DailyQuiz | null;
    leaderboard: Player[];
    weeklyKingOfQuiz: KingOfQuiz | null;
}

export const initialGlobalEngagement: GlobalEngagement = {
    dailyQuiz: null,
    leaderboard: [],
    weeklyKingOfQuiz: null,
};