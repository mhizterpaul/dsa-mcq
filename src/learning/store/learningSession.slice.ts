import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LearningSession } from '../interface';

interface LearningSessionState {
  session: LearningSession | null;
}

const initialState: LearningSessionState = {
  session: null,
};

const learningSessionSlice = createSlice({
  name: 'learningSession',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<LearningSession>) => {
      state.session = action.payload;
    },
    endSession: (state) => {
      if (state.session) {
        state.session.endTime = Date.now();
      }
    },
    clearSession: (state) => {
      state.session = null;
    },
    updateSession: (state, action: PayloadAction<Partial<LearningSession>>) => {
      if (state.session) {
        state.session = { ...state.session, ...action.payload };
      }
    },
  },
});

export const {
  startSession,
  endSession,
  clearSession,
  updateSession,
} = learningSessionSlice.actions;

export default learningSessionSlice.reducer;
