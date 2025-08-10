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
    startSession: (state, action: PayloadAction<{ id: string; userId: string; questionIds: string[] }>) => {
      const { id, userId, questionIds } = action.payload;
      const newSession = new LearningSession(id, userId, questionIds);
      state.session = { ...newSession };
    },
    answerQuestion: (state, action: PayloadAction<{ questionId: string; answer: string; isCorrect: boolean }>) => {
      if (state.session) {
        const { questionId, answer, isCorrect } = action.payload;
        const sessionInstance = Object.assign(new LearningSession(state.session.id, state.session.userId, state.session.questionIds), state.session);
        sessionInstance.answerQuestion(questionId, answer, isCorrect);
        state.session = { ...sessionInstance };
      }
    },
    endSession: (state) => {
      if (state.session) {
        const sessionInstance = Object.assign(new LearningSession(state.session.id, state.session.userId, state.session.questionIds), state.session);
        sessionInstance.end();
        state.session = { ...sessionInstance };
      }
    },
    clearSession: (state) => {
      state.session = null;
    },
  },
});

export const {
  startSession,
  endSession,
  clearSession,
  answerQuestion,
} = learningSessionSlice.actions;

export default learningSessionSlice.reducer;
