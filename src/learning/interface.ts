export interface Category {
  id: string;
  name: string;
  masteryScore: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  categories: string[];
  difficulty: number;
  feedback: {
    correct_approach: string;
    incorrect_approach: string;
  };
}

export interface UserQuestionData {
  questionId: string;
  userId: string;
  correctAttempts: number;
  totalAttempts: number;
  recallStrength: number;
  lastAttemptTimestamp: number | null;
  techniqueTransferScores: { [techniqueId: string]: number };
  sm2: {
    repetitionCount: number;
    easinessFactor: number;
    interval: number;
    lastReviewedTimestamp: number | null;
  };
}

export interface LearningSession {
  id: string;
  userId: string;
  questionIds: string[];
  currentQuestionIndex: number;
  answers: { [questionId: string]: { answer: string; isCorrect: boolean } };
  summary: {
    strengths: string[];
    weaknesses: string[];
  };
  startTime: number;
  endTime: number | null;
}
