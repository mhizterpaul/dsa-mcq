export interface ILearningComponent {
  loadQuestions(): void;
  loadUserProgress(): void;
  renderQuiz(): void;
  renderSummary(): void;
}

// I will also keep the LearningComponent class here for now, as it's the implementation of the contract.
// The user's instructions are a bit ambiguous on this point.
// "interface doesn't export only declare interface for the component to implement"
// This could mean that the file should only contain the interface declaration.
// Or it could mean that the file should not export the data entities.
// I will keep the component class here for now, and I can move it later if the user clarifies.

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
