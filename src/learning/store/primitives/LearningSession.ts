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
