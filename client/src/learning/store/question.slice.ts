import { createSlice, createEntityAdapter, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Question } from './primitives/Question';
import { generateFeedback } from '../services/feedbackService';
import { RootState } from '../../mediator/store/rootReducer';

const questionsAdapter = createEntityAdapter<Question>({
  selectId: (question) => question.id,
});

export const fetchFeedbackForQuestion = createAsyncThunk(
  'questions/fetchFeedback',
  async (questionId: string, { getState }) => {
    const state = getState() as RootState;
    const question = state.learning.questions.entities[questionId];

    if (!question) {
      throw new Error(`Question with id ${questionId} not found.`);
    }

    const feedback = await generateFeedback(question);
    return { questionId, feedback };
  }
);

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
  extraReducers: (builder) => {
    builder.addCase(fetchFeedbackForQuestion.fulfilled, (state, action) => {
      const { questionId, feedback } = action.payload;
      questionsAdapter.updateOne(state, {
        id: questionId,
        changes: { feedback },
      });
    });
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
