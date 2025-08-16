import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Achievement } from './primitives/Achievement';

const achievementsAdapter = createEntityAdapter<Achievement>();

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState: achievementsAdapter.getInitialState(),
  reducers: {
    addAchievement: achievementsAdapter.addOne,
    addAchievements: achievementsAdapter.addMany,
    updateAchievement: achievementsAdapter.updateOne,
  },
});

export const { addAchievement, addAchievements, updateAchievement } = achievementsSlice.actions;

export default achievementsSlice.reducer;
