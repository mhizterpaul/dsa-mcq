export interface User {
  id: string;
  username: string;
  email: string;
  hashedPassword?: string; // Should not be stored in the frontend store
  isBlacklisted: boolean;
  authToken: string | null;
  masteryLevels: { [categoryId: string]: number };
  historicalPerformance: any[]; // Consider a more specific type
  preferences: {
    difficulty: 'easy' | 'medium' | 'hard';
  };
}
