import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SharedState } from '../interface';

const initialState: SharedState = {};

const sharedStateSlice = createSlice({
  name: 'sharedState',
  initialState,
  reducers: {
    setSharedState: (state, action: PayloadAction<{ key: string; value: any }>) => {
      state[action.payload.key] = action.payload.value;
    },
    removeSharedState: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
    clearSharedState: (state) => {
      return {};
    },
  },
});

export const {
  setSharedState,
  removeSharedState,
  clearSharedState,
} = sharedStateSlice.actions;

export default sharedStateSlice.reducer;
