import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { RecentQuiz } from './primitives/RecentQuiz';

export const recentQuizzesAdapter = createEntityAdapter<RecentQuiz>();

const recentQuizzesSlice = createSlice({
  name: 'recentQuizzes',
  initialState: recentQuizzesAdapter.getInitialState(),
  reducers: {
    addRecentQuiz: recentQuizzesAdapter.addOne,
  },
});

export const { addRecentQuiz } = recentQuizzesSlice.actions;
export default recentQuizzesSlice.reducer;