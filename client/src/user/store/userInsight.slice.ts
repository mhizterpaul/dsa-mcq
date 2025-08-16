import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserInsight } from './primitives/UserInsight';

interface UserInsightState {
  insight: UserInsight | null;
}

const initialState: UserInsightState = {
  insight: null,
};

const userInsightSlice = createSlice({
  name: 'userInsight',
  initialState,
  reducers: {
    setUserInsight: (state, action: PayloadAction<UserInsight>) => {
      state.insight = action.payload;
    },
  },
});

export const { setUserInsight } = userInsightSlice.actions;
export default userInsightSlice.reducer;
