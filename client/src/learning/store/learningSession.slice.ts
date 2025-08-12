import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { LearningSession } from './primitives/LearningSession';
import { learningService } from '../services/learningService';
import { LearningRootState } from './store';
import { UserQuestionData } from './primitives/UserQuestionData';
import { setUserQuestionData } from './userQuestionData.slice';
import { sqliteService } from '../../common/services/sqliteService';

// --- STATE AND INITIAL STATE ---
interface LearningSessionState {
  session: LearningSession | null;
  recommendations: {
    questions: { questionId: string; recommendationScore: number }[];
    categories: { categoryId: string; recommendationLevel: string; explanation: string }[];
  } | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
}

const initialState: LearningSessionState = {
  session: null,
  recommendations: null,
  loading: 'idle',
};

// --- UTILITY FUNCTIONS FOR DB ---
const stringifySession = (session: LearningSession) => ({
  ...session,
  allQuestionIds: JSON.stringify(session.allQuestionIds),
  questionIds: JSON.stringify(session.questionIds),
  subsetHistory: JSON.stringify(session.subsetHistory),
  answers: JSON.stringify(session.answers),
  summary: JSON.stringify(session.summary),
  is_dirty: 1,
});

const parseSession = (dbSession: any): LearningSession => ({
  ...dbSession,
  allQuestionIds: JSON.parse(dbSession.allQuestionIds || '[]'),
  questionIds: JSON.parse(dbSession.questionIds || '[]'),
  subsetHistory: JSON.parse(dbSession.subsetHistory || '[]'),
  answers: JSON.parse(dbSession.answers || '{}'),
  summary: JSON.parse(dbSession.summary || '{"strengths":[],"weaknesses":[]}'),
});


// --- ASYNC THUNKS ---

export const hydrateLearningSession = createAsyncThunk<LearningSession | null>(
  'learningSession/hydrate',
  async () => {
    // For simplicity, we get the last session. A real app might get the last active one.
    const sessions = await sqliteService.getAll('learning_sessions');
    if (sessions.length > 0) {
      const lastSession = sessions[sessions.length - 1];
      return parseSession(lastSession);
    }
    return null;
  },
);

export const saveSessionDb = createAsyncThunk(
    'learningSession/saveSessionDb',
    async (session: LearningSession) => {
        const sessionToSave = stringifySession(session);
        // Use create which will act as an upsert in this simplified service
        await sqliteService.create('learning_sessions', sessionToSave);
        return session;
    }
);

export const startNewSession = createAsyncThunk(
    'learningSession/startNewSession',
    async ({ userId, allQuestionIds, subsetSize }: { userId: string, allQuestionIds: string[], subsetSize: number }, { getState, dispatch }) => {
        const state = getState() as LearningRootState;
        const userQuestionData = Object.values(state.userQuestionData.entities).filter(Boolean) as UserQuestionData[];
        const newSession = learningService.startNewSession(userId, allQuestionIds, userQuestionData, subsetSize);
        dispatch(saveSessionDb(newSession)); // Dispatch save action
        return newSession;
    }
);

export const processAnswerAndUpdate = createAsyncThunk(
    'learningSession/processAnswer',
    async ({ userId, questionId, answer, isCorrect, quality, techniqueIds }: { userId: string, questionId: string, answer: string, isCorrect: boolean, quality: number, techniqueIds?: string[] }, { getState, dispatch }) => {
        const state = getState() as LearningRootState;
        const uqd = state.userQuestionData.entities[`${userId}-${questionId}`];
        if (uqd) {
            const updatedUqd = learningService.processAnswer(uqd, isCorrect, quality, techniqueIds);
            dispatch(setUserQuestionData(updatedUqd)); // This should also be a DB thunk
        }
        // We need to get the updated session from state to save it
        const updatedSession = (getState() as LearningRootState).learningSession.session;
        if (updatedSession) {
            const sessionCopy = { ...updatedSession };
            sessionCopy.answers[questionId] = { answer, isCorrect };
            sessionCopy.currentQuestionIndex++;
            dispatch(saveSessionDb(sessionCopy));
        }
        return { questionId, answer, isCorrect };
    }
);

export const endCurrentSession = createAsyncThunk(
    'learningSession/endCurrentSession',
    async (_, { getState, dispatch }) => {
        const state = getState() as LearningRootState;
        const session = state.learningSession.session;
        if (session) {
            const summary = learningService.compileSessionSummary(session.answers);
            const finalSession = { ...session, summary, endTime: Date.now() };
            dispatch(saveSessionDb(finalSession));
            return summary;
        }
        return { strengths: [], weaknesses: [] };
    }
);

// ... (generateRecommendations thunk remains the same)
export const generateRecommendations = createAsyncThunk(
  'learningSession/generateRecommendations',
  async (_, { getState }) => {
    const state = getState() as LearningRootState;
    const userQuestionData = Object.values(state.userQuestionData.entities).filter(Boolean) as UserQuestionData[];
    const categories = Object.values(state.categories.entities).filter(Boolean);
    const questionRecommendations = learningService.getTopKQuestionRecommendations(userQuestionData, 3);
    const categoryRecommendations = learningService.getCategoryRecommendations(categories);
    return {
      questions: questionRecommendations,
      categories: categoryRecommendations,
    };
  }
);


// --- SLICE DEFINITION ---
const learningSessionSlice = createSlice({
  name: 'learningSession',
  initialState,
  reducers: {
    clearSession: (state) => {
      state.session = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateLearningSession.fulfilled, (state, action: PayloadAction<LearningSession | null>) => {
        if (action.payload) {
            state.session = action.payload;
        }
      })
      .addCase(startNewSession.fulfilled, (state, action) => {
        state.session = action.payload;
      })
      .addCase(processAnswerAndUpdate.fulfilled, (state, action) => {
          if (state.session) {
            const { questionId, answer, isCorrect } = action.payload;
            state.session.answers[questionId] = { answer, isCorrect };
            state.session.currentQuestionIndex++;
          }
      })
      .addCase(endCurrentSession.fulfilled, (state, action) => {
          if (state.session) {
              state.session.summary = action.payload;
              state.session.endTime = Date.now();
          }
      })
      // Recommendations reducers
      .addCase(generateRecommendations.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(generateRecommendations.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.recommendations = action.payload;
      })
      .addCase(generateRecommendations.rejected, (state) => {
        state.loading = 'failed';
      });
  },
});

export const { clearSession } = learningSessionSlice.actions;
export default learningSessionSlice.reducer;
