// Data Entities
export class Category {
  id: string;
  name: string;
  masteryScore: number;

  constructor(id: string, name: string, masteryScore: number = 0) {
    this.id = id;
    this.name = name;
    this.masteryScore = masteryScore;
  }
}

export class Question {
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

  constructor(
    id: string,
    text: string,
    options: string[],
    correctOption: number,
    categories: string[],
    difficulty: number,
    feedback: { correct_approach: string; incorrect_approach: string }
  ) {
    this.id = id;
    this.text = text;
    this.options = options;
    this.correctOption = correctOption;
    this.categories = categories;
    this.difficulty = difficulty;
    this.feedback = feedback;
  }
}

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

export class LearningSession {
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

  constructor(id: string, userId: string, questionIds: string[]) {
    this.id = id;
    this.userId = userId;
    this.questionIds = questionIds;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.summary = { strengths: [], weaknesses: [] };
    this.startTime = Date.now();
    this.endTime = null;
  }

  answerQuestion(questionId: string, answer: string, isCorrect: boolean) {
    this.answers[questionId] = { answer, isCorrect };
    this.currentQuestionIndex++;
  }

  end() {
    this.endTime = Date.now();
    // In a real implementation, we would generate the summary here.
  }
}

// Component Contract
export class LearningComponent {
  loadQuestions() {
    console.log("Loading questions...");
  }

  loadUserProgress() {
    console.log("Loading user progress...");
  }

  renderQuiz() {
    console.log("Rendering quiz...");
  }

  renderSummary() {
    console.log("Rendering summary...");
  }
}
