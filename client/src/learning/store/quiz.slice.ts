import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuizState {
  questions: string[];
  currentQuestionIndex: number;
  score: number;
  isActive: boolean;
}

const initialState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  isActive: false,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    startQuiz: (state, action: PayloadAction<string[]>) => {
      state.questions = action.payload;
      state.currentQuestionIndex = 0;
      state.score = 0;
      state.isActive = true;
    },
    answerQuestion: (state, action: PayloadAction<{ questionId: string; isCorrect: boolean }>) => {
      if (action.payload.isCorrect) {
        state.score++;
      }
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex++;
      } else {
        state.isActive = false;
      }
    },
  },
});

export const { startQuiz, answerQuestion, nextQuestion } = quizSlice.actions;
export default quizSlice.reducer;
