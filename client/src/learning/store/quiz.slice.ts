import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Quiz } from './primitives/Quiz';

interface QuizState {
  quizzes: { [id: string]: Quiz };
  activeQuizId: string | null;
  currentQuestionIndex: number;
  score: number;
}

const initialState: QuizState = {
  quizzes: {},
  activeQuizId: null,
  currentQuestionIndex: 0,
  score: 0,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    addQuiz: (state, action: PayloadAction<Quiz>) => {
      state.quizzes[action.payload.id] = action.payload;
    },
    startQuiz: (state, action: PayloadAction<string>) => {
      state.activeQuizId = action.payload;
      state.currentQuestionIndex = 0;
      state.score = 0;
    },
    answerQuestion: (state, action: PayloadAction<{ questionId: string; isCorrect: boolean }>) => {
      if (action.payload.isCorrect) {
        state.score++;
      }
    },
    nextQuestion: (state) => {
        if (state.activeQuizId) {
            const quiz = state.quizzes[state.activeQuizId];
            if (state.currentQuestionIndex < quiz.questions.length - 1) {
                state.currentQuestionIndex++;
            } else {
                state.activeQuizId = null;
            }
        }
    },
  },
});

export const { addQuiz, startQuiz, answerQuestion, nextQuestion } = quizSlice.actions;
export default quizSlice.reducer;
