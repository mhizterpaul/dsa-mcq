import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { GlobalEngagement, DailyQuiz, Player, KingOfQuiz, initialGlobalEngagement } from './primitives/globalEngagement';
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
  loading: boolean;
  error: string | null;
}

const initialState: GlobalEngagementState = {
  engagement: initialGlobalEngagement,
  loading: false,
  error: null,
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
    builder
        .addCase(fetchLeaderboard.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchLeaderboard.fulfilled, (state, action: PayloadAction<Player[]>) => {
            state.engagement.leaderboard = action.payload;
            state.loading = false;
        })
        .addCase(fetchLeaderboard.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to fetch leaderboard';
        });
  },
});

export const { setDailyQuiz, setLeaderboard, setWeeklyKingOfQuiz } = globalEngagementSlice.actions;
export default globalEngagementSlice.reducer;