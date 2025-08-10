import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserEngagement } from '../interface';

interface UserEngagementState {
  [userId: string]: UserEngagement;
}

const initialState: UserEngagementState = {};

const userEngagementSlice = createSlice({
  name: 'userEngagement',
  initialState,
  reducers: {
    setUserEngagement: (state, action: PayloadAction<{ userId: string }>) => {
      const { userId } = action.payload;
      const newUserEngagement = new UserEngagement(userId);
      state[userId] = { ...newUserEngagement };
    },
    updateStreak: (state, action: PayloadAction<{ userId: string; didAttend: boolean }>) => {
      const { userId, didAttend } = action.payload;
      const existingData = state[userId];
      if (existingData) {
        const engagementInstance = Object.assign(new UserEngagement(userId), existingData);
        engagementInstance.updateStreak(didAttend);
        state[userId] = { ...engagementInstance };
      }
    },
    addXp: (state, action: PayloadAction<{ userId: string; points: number }>) => {
        const { userId, points } = action.payload;
        const existingData = state[userId];
        if (existingData) {
          const engagementInstance = Object.assign(new UserEngagement(userId), existingData);
          engagementInstance.addXp(points);
          state[userId] = { ...engagementInstance };
        }
      },
  },
});

export const {
  setUserEngagement,
  updateStreak,
  addXp,
} = userEngagementSlice.actions;

export default userEngagementSlice.reducer;
