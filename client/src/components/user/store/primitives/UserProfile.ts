// Feedback attached to a question response
export class Feedback {
  positive: string; // Encouragement or what was done right
  negative: string; // Constructive correction or what went wrong

  constructor(positive: string, negative: string) {
    this.positive = positive;
    this.negative = negative;
  }
}

// Each bookmarked question with response + metadata
export class QuestionResponse {
  questionId: string;
  mostRecentAnswer: string;
  isCorrect: boolean;
  feedback: Feedback | null; // only when answer is wrong
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'expert';

  constructor(
    questionId: string,
    mostRecentAnswer: string,
    isCorrect: boolean,
    difficultyLevel: 'easy' | 'medium' | 'hard' | 'expert',
    feedback: Feedback | null = null
  ) {
    this.questionId = questionId;
    this.mostRecentAnswer = mostRecentAnswer;
    this.isCorrect = isCorrect;
    this.difficultyLevel = difficultyLevel;
    this.feedback = feedback;
  }
}

// Possible user goals (could be expanded in the app)
export type UserGoal =
  | 'Improve speed'
  | 'Master weak topics'
  | 'Consistency streak'
  | 'Rank up globally'
  | 'Earn badges'
  | 'Daily learning habit'
  | 'Compete with friends';

// Achievement badges (gamification system)
export type AchievementBadge =
  | 'First Quiz Completed'
  | 'Perfect Score'
  | 'Speedster' // fastest time
  | 'Persistence' // 7-day streak
  | 'Scholar' // high accuracy
  | 'Explorer' // tried all categories
  | 'Champion' // top 1% globally
  | 'Helper' // gave feedback/help to others
  | 'Comeback Kid' // big improvement since last play
  | null;

// User settings
export class UserSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  language: string; // e.g., 'en', 'fr', 'es'
  soundEffects: boolean;

  constructor() {
    this.theme = 'system';
    this.notificationsEnabled = true;
    this.language = 'en';
    this.soundEffects = true;
  }
}

// User Profile main entity
export class UserProfile {
  userId: string;
  bookmarks: QuestionResponse[];
  goals: UserGoal[];
  totalXP: number;
  correctAnswers: number; // total correct answers
  completedQuizzes: number; // total quizzes completed
  globalRanking: number; // rank/level derived from XP
  highestAchievement: AchievementBadge;
  settings: UserSettings;

  constructor(userId: string) {
    this.userId = userId;
    this.bookmarks = [];
    this.goals = [];
    this.totalXP = 0;
    this.correctAnswers = 0;
    this.completedQuizzes = 0;
    this.globalRanking = NaN;
    this.highestAchievement = null;
    this.settings = new UserSettings();
  }
}
