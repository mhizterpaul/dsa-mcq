export interface ILearningComponent {
  loadQuestions(): void;
  loadUserProgress(): void;
  renderQuiz(): void;
  renderSummary(): void;
}

export class LearningComponent implements ILearningComponent {
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
