import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Question } from './primitives/Question';

const questionsAdapter = createEntityAdapter<Question>({
  selectId: (question) => question.id,
});

const questionSlice = createSlice({
  name: 'questions',
  initialState: questionsAdapter.getInitialState(),
  reducers: {
    addQuestion: (state, action: PayloadAction<{ id: string; text: string; options: string[]; correctOption: number; categories: string[]; difficulty: number; feedback: { correct_approach: string; incorrect_approach: string; } }>) => {
      const { id, text, options, correctOption, categories, difficulty, feedback } = action.payload;
      const newQuestion = new Question(id, text, options, correctOption, categories, difficulty, feedback);
      questionsAdapter.addOne(state, { ...newQuestion });
    },
    addQuestions: (state, action: PayloadAction<{ id: string; text: string; options: string[]; correctOption: number; categories: string[]; difficulty: number; feedback: { correct_approach: string; incorrect_approach: string; } }[]>) => {
        const newQuestions = action.payload.map(({ id, text, options, correctOption, categories, difficulty, feedback }) => {
            const newQuestion = new Question(id, text, options, correctOption, categories, difficulty, feedback);
            return { ...newQuestion };
        });
        questionsAdapter.addMany(state, newQuestions);
    },
    updateQuestion: questionsAdapter.updateOne,
    removeQuestion: questionsAdapter.removeOne,
    setQuestions: (state, action: PayloadAction<{ id: string; text: string; options: string[]; correctOption: number; categories: string[]; difficulty: number; feedback: { correct_approach: string; incorrect_approach: string; } }[]>) => {
        const newQuestions = action.payload.map(({ id, text, options, correctOption, categories, difficulty, feedback }) => {
            const newQuestion = new Question(id, text, options, correctOption, categories, difficulty, feedback);
            return { ...newQuestion };
        });
        questionsAdapter.setAll(state, newQuestions);
    },
  },
});

export const {
  addQuestion,
  addQuestions,
  updateQuestion,
  removeQuestion,
  setQuestions,
} = questionSlice.actions;

export default questionSlice.reducer;
