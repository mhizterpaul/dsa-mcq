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
    setUserEngagement: (state, action: PayloadAction<UserEngagement>) => {
      state[action.payload.userId] = action.payload;
    },
    updateUserEngagement: (state, action: PayloadAction<{ userId: string; updates: Partial<UserEngagement> }>) => {
      const { userId, updates } = action.payload;
      if (state[userId]) {
        state[userId] = { ...state[userId], ...updates };
      }
    },
  },
});

export const {
  setUserEngagement,
  updateUserEngagement,
} = userEngagementSlice.actions;

export default userEngagementSlice.reducer;
