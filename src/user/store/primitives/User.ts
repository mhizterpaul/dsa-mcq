export class User {
  id: string;
  username: string;
  email: string;
  isBlacklisted: boolean;
  authToken: string | null;
  masteryLevels: { [categoryId: string]: number };
  historicalPerformance: any[];
  preferences: {
    difficulty: 'easy' | 'medium' | 'hard';
  };

  constructor(id: string, username: string, email: string) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.isBlacklisted = false;
    this.authToken = null;
    this.masteryLevels = {};
    this.historicalPerformance = [];
    this.preferences = { difficulty: 'medium' };
  }

  updatePreference(difficulty: 'easy' | 'medium' | 'hard') {
    this.preferences.difficulty = difficulty;
  }

  updateMasteryLevel(categoryId: string, score: number) {
    this.masteryLevels[categoryId] = score;
  }
}
