export class UserQuestionData {
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

  constructor(userId: string, questionId: string) {
    this.userId = userId;
    this.questionId = questionId;
    this.correctAttempts = 0;
    this.totalAttempts = 0;
    this.recallStrength = 0;
    this.lastAttemptTimestamp = null;
    this.techniqueTransferScores = {};
    this.sm2 = {
      repetitionCount: 0,
      easinessFactor: 2.5,
      interval: 0,
      lastReviewedTimestamp: null,
    };
  }

  updateRecallOnCorrectAnswer() {
    this.correctAttempts++;
    this.totalAttempts++;
    this.recallStrength = Math.min(1, this.recallStrength + 0.1);
    this.lastAttemptTimestamp = Date.now();
  }

  updateRecallOnIncorrectAnswer() {
    this.totalAttempts++;
    this.recallStrength = Math.max(0, this.recallStrength - 0.2);
    this.lastAttemptTimestamp = Date.now();
  }
}
