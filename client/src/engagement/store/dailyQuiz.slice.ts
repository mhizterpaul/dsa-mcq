import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DailyQuizState {
  title: string;
  description: string;
  quizId: string | null;
}

const initialState: DailyQuizState = {
  title: 'Daily Quiz',
  description: 'Join a quiz to win diamonds',
  quizId: null,
};

const dailyQuizSlice = createSlice({
  name: 'dailyQuiz',
  initialState,
  reducers: {
    setDailyQuiz: (state, action: PayloadAction<{ title: string; description: string; quizId: string }>) => {
      state.title = action.payload.title;
      state.description = action.payload.description;
      state.quizId = action.payload.quizId;
    },
  },
});

export const { setDailyQuiz } = dailyQuizSlice.actions;
export default dailyQuizSlice.reducer;
