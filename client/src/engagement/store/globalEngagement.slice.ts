import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GlobalEngagement, DailyQuiz, Player, KingOfQuiz } from './primitives/globalEngagement';

interface GlobalEngagementState {
  engagement: GlobalEngagement;
}

const initialState: GlobalEngagementState = {
  engagement: new GlobalEngagement(),
};

const globalEngagementSlice = createSlice({
  name: 'globalEngagement',
  initialState,
  reducers: {
    setDailyQuiz: (state, action: PayloadAction<DailyQuiz>) => {
      state.engagement.dailyQuiz = action.payload;
    },
    setLeaderboard: (state, action: PayloadAction<Player[]>) => {
      state.engagement.leaderboard = action.payload;
    },
    setWeeklyKingOfQuiz: (state, action: PayloadAction<KingOfQuiz>) => {
      state.engagement.weeklyKingOfQuiz = action.payload;
    },
  },
});

export const { setDailyQuiz, setLeaderboard, setWeeklyKingOfQuiz } = globalEngagementSlice.actions;
export default globalEngagementSlice.reducer;
