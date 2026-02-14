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

  updateRecallOnCorrectAnswer(techniqueIds: string[] = []) {
    this.correctAttempts++;
    this.totalAttempts++;
    // mastery score (0 to 1)
    // Increases proportionally to successful recall
    this.recallStrength = Math.min(1, this.recallStrength + 0.1);
    this.lastAttemptTimestamp = Date.now();
    techniqueIds.forEach(id => {
        this.techniqueTransferScores[id] = Math.min(1, (this.techniqueTransferScores[id] || 0) + 0.1);
    });
  }

  updateRecallOnIncorrectAnswer(techniqueIds: string[] = []) {
    this.totalAttempts++;
    // reflect poor recall
    this.recallStrength = Math.max(0, this.recallStrength - 0.2);
    if (this.totalAttempts === 1) {
        this.recallStrength = 0.1; // low value reflecting poor recall on first attempt
    }
    this.lastAttemptTimestamp = Date.now();
    techniqueIds.forEach(id => {
        this.techniqueTransferScores[id] = Math.max(0, (this.techniqueTransferScores[id] || 0) - 0.1);
    });
  }

  decayRecallStrength() {
    const decayThreshold = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();
    if (this.lastAttemptTimestamp && (now - this.lastAttemptTimestamp > decayThreshold)) {
      const daysElapsed = Math.floor((now - this.lastAttemptTimestamp) / decayThreshold);
      const decayAmount = 0.1 * daysElapsed;
      this.recallStrength = Math.max(0, this.recallStrength - decayAmount);

      // Decay technique scores as well
      Object.keys(this.techniqueTransferScores).forEach(id => {
          this.techniqueTransferScores[id] = Math.max(0, this.techniqueTransferScores[id] - (0.05 * daysElapsed));
      });
    }
  }

  canRequestFeedback(): boolean {
    return this.totalAttempts > 0;
  }

  processFeedbackRequest() {
    // metadata state may update if feedback involves corrective steps or hints
    // For now, just mark that feedback was requested if needed
  }
}
