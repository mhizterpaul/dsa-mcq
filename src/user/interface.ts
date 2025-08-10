// Data Entities
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

// Component Contract
export class UserComponent {
    loadUserProfile() {
        console.log("Loading user profile...");
    }

    authenticateUser() {
        console.log("Authenticating user...");
    }

    renderProfile() {
        console.log("Rendering profile...");
    }

    renderLogin() {
        console.log("Rendering login...");
    }
}
