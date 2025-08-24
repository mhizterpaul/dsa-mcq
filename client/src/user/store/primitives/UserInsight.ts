export class UserInsight {
  userId: string;

  // Quiz performance
  bestQuizPerformance: number; // % score of best quiz
  averageQuizPerformance: number; // % average across all quizzes
  changeSinceLastPlay: number; // Δ performance since last session

  // Speed/response
  averageResponseTime: number; // ms per question
  bestFinishingTime: number; // ms for fastest quiz completion
  changeInResponseTime: number; // Δ response speed since last play

  // Category insights
  attemptedCategories: { category: string; avgPerformance: number }[];
  categoryQuantiles: { category: string; quantile: number }[]; // global comparison (0–1)

  // Behavioral archetype
  thinkingArchetype: string; // e.g., "Impulsive", "Analytical", "Balanced"
  weakAreas: string[]; // topics/categories needing practice

  // Metadata
  lastUpdated: Date; // when insights were last refreshed
  totalQuizzesAttempted: number;
  totalQuestionsAttempted: number;

  constructor(userId: string) {
    this.userId = userId;

    this.bestQuizPerformance = 0;
    this.averageQuizPerformance = 0;
    this.changeSinceLastPlay = 0;

    this.averageResponseTime = 0;
    this.bestFinishingTime = 0;
    this.changeInResponseTime = 0;

    this.attemptedCategories = [];
    this.categoryQuantiles = [];

    this.thinkingArchetype = '';
    this.weakAreas = [];

    this.lastUpdated = new Date();
    this.totalQuizzesAttempted = 0;
    this.totalQuestionsAttempted = 0;
  }
}
