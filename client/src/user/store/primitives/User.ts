export class User {
  id: string;
  username: string;
  email: string;
  isBlacklisted: boolean;
  authToken: string | null;
  bookmarkedQuestions: string[];
  goals: { id: string; text: string; completed: boolean }[];
  performanceHistory: number[];
  insights: { category: string; performance: number; level: string; personality: string }[];

  constructor(id: string, username: string, email: string) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.isBlacklisted = false;
    this.authToken = null;
    this.bookmarkedQuestions = [];
    this.goals = [];
    this.performanceHistory = [];
    this.insights = [];
  }

  addGoal(goal: { id: string; text: string; completed: boolean }) {
    this.goals.push(goal);
  }

  toggleGoal(goalId: string) {
    const goal = this.goals.find((g) => g.id === goalId);
    if (goal) {
      goal.completed = !goal.completed;
    }
  }

  addBookmark(questionId: string) {
    if (!this.bookmarkedQuestions.includes(questionId)) {
      this.bookmarkedQuestions.push(questionId);
    }
  }

  removeBookmark(questionId: string) {
    this.bookmarkedQuestions = this.bookmarkedQuestions.filter(
      (id) => id !== questionId
    );
  }

  addPerformanceData(score: number) {
    this.performanceHistory.push(score);
    if (this.performanceHistory.length > 15) {
      this.performanceHistory.shift();
    }
  }

  addInsight(insight: { category: string; performance: number; level: string; personality: string }) {
    this.insights.push(insight);
  }
}
