export class Question {
  id: string;
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
    options: string[],
    correctOption: number,
    categories: string[],
    difficulty: number,
    feedback: { correct_approach: string; incorrect_approach: string }
  ) {
    this.id = id;
    this.options = options;
    this.correctOption = correctOption;
    this.categories = categories;
    this.difficulty = difficulty;
    this.feedback = feedback;
  }
}
