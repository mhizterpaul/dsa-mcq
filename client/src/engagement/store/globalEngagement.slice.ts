import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { GlobalEngagement, DailyQuiz, Player, KingOfQuiz } from './primitives/globalEngagement';
import { API_BASE_URL } from '../../learning/services/learningService'; // Re-using this constant

export const fetchLeaderboard = createAsyncThunk<Player[]>(
    'globalEngagement/fetchLeaderboard',
    async () => {
        const response = await fetch(`${API_BASE_URL}/engagement/leaderboard`);
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        return await response.json();
    }
);

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
  extraReducers: (builder) => {
    builder.addCase(fetchLeaderboard.fulfilled, (state, action: PayloadAction<Player[]>) => {
        state.engagement.leaderboard = action.payload;
    });
  },
});

export const { setDailyQuiz, setLeaderboard, setWeeklyKingOfQuiz } = globalEngagementSlice.actions;
export default globalEngagementSlice.reducer;
