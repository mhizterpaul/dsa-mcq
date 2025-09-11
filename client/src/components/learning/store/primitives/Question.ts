import { Feedback } from "../../services/feedbackService";

export class Question {
    id: string;
    text: string;
    options: string[];
    correctOption: number;
    categories: string[];
    difficulty: number;
    feedback?: Feedback;

    constructor(
      id: string,
      text: string,
      options: string[],
      correctOption: number,
      categories: string[],
      difficulty: number,
      feedback?: Feedback,
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
