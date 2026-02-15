import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { LearningSession } from './primitives/LearningSession';
import { learningService } from '../services/learningService';
import { UserQuestionData } from './primitives/UserQuestionData';

import { setUserQuestionDataDb } from './userQuestionData.slice';
import { sqliteService } from '../../common/services/sqliteService';
import { fetchBatchFeedback } from './question.slice';


// --- STATE AND INITIAL STATE ---
interface LearningSessionState {
  session: any | null;
  recommendations: { /* ... */ } | null;
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


const parseSession = (dbSession: any): LearningSession => {
  const allQuestionIds = typeof dbSession.allQuestionIds === 'string' ? JSON.parse(dbSession.allQuestionIds || '[]') : (dbSession.allQuestionIds || []);
  const session = new LearningSession(dbSession.id, dbSession.userId, allQuestionIds);
  return Object.assign(session, {
    ...dbSession,
    questionIds: typeof dbSession.questionIds === 'string' ? JSON.parse(dbSession.questionIds || '[]') : (dbSession.questionIds || []),
    subsetHistory: typeof dbSession.subsetHistory === 'string' ? JSON.parse(dbSession.subsetHistory || '[]') : (dbSession.subsetHistory || []),
    answers: typeof dbSession.answers === 'string' ? JSON.parse(dbSession.answers || '{}') : (dbSession.answers || {}),
    summary: typeof dbSession.summary === 'string' ? JSON.parse(dbSession.summary || '{"strengths":[],"weaknesses":[]}') : (dbSession.summary || {strengths:[], weaknesses:[]}),
  });
};



// --- ASYNC THUNKS ---

export const hydrateLearningSession = createAsyncThunk<any | null>(
  'learningSession/hydrate',
  async () => {

    const sessions = await sqliteService.getAll('learning_sessions');
    if (sessions.length > 0) return JSON.parse(JSON.stringify(parseSession(sessions[sessions.length - 1])));

    return null;
  },
);

export const saveSessionDb = createAsyncThunk(
    'learningSession/saveSessionDb',
    async (session: LearningSession) => {

        await sqliteService.create('learning_sessions', stringifySession(session));

        return JSON.parse(JSON.stringify(session));
    }
);

export const startNewSession = createAsyncThunk(
    'learningSession/startNewSession',
    async ({ userId, allQuestionIds, subsetSize }: { userId: string, allQuestionIds: string[], subsetSize: number }, { getState, dispatch }) => {
        const state = getState() as any;
        const learningState = state.learning || state;
        const userQuestionDataEntities = learningState.userQuestionData?.entities || {};

        const userQuestionData = Object.values(userQuestionDataEntities)
            .filter((uqd): uqd is any => !!uqd)
            .map(uqd => {
                const instance = new UserQuestionData(uqd.userId, uqd.questionId);
                return Object.assign(instance, uqd);
            });

        const newSession = learningService.startNewSession(userId, allQuestionIds, userQuestionData, subsetSize);

        dispatch(saveSessionDb(newSession));
        return JSON.parse(JSON.stringify(newSession));
    }
);

export const processAnswerAndUpdate = createAsyncThunk(
    'learningSession/processAnswer',
    async ({ userId, questionId, answer, isCorrect, quality, techniqueIds }: { userId: string, questionId: string, answer: string, isCorrect: boolean, quality: number, techniqueIds?: string[] }, { getState, dispatch }) => {
        const state = getState() as any;
        const learningState = state.learning || state;

        // Update UserQuestionData
        dispatch(setUserQuestionDataDb({ userId, questionId, isCorrect, quality, techniqueIds }));

        // Update session and check for feedback batching
        const currentSession = learningState.learningSession?.session;
        let batchesNeeded = 0;
        if (currentSession) {
            const answeredCount = Object.keys(currentSession.answers).length + 1; // +1 for the current answer
            const totalQuestions = currentSession.allQuestionIds.length;
            const threshold = Math.max(1, Math.floor(totalQuestions / 4));
            batchesNeeded = Math.floor(answeredCount / threshold);

            if (batchesNeeded > currentSession.feedbackBatchesGenerated) {
                const questionIdsForFeedback = Object.keys(currentSession.answers);
                if (!questionIdsForFeedback.includes(questionId)) {
                    questionIdsForFeedback.push(questionId);
                }

                dispatch(fetchBatchFeedback(questionIdsForFeedback));
            }
        }

        return { questionId, answer, isCorrect, batchesNeeded: batchesNeeded };
    }
);

export const endCurrentSession = createAsyncThunk(
    'learningSession/endCurrentSession',
    async (_, { getState, dispatch }) => {
        const state = getState() as any;
        const learningState = state.learning || state;
        const session = learningState.learningSession?.session;
        if (session) {
            const summary = learningService.compileSessionSummary(session.answers);
            const finalSession = { ...session, summary, endTime: Date.now() };
            dispatch(saveSessionDb(finalSession as any));
            return summary;
        }
        return { strengths: [], weaknesses: [] };
    }
);

export const nextSubset = createAsyncThunk(
    'learningSession/nextSubset',
    async ({ subsetSize }: { subsetSize: number }, { getState, dispatch }) => {
        const state = getState() as any;
        const learningState = state.learning || state;
        const session = learningState.learningSession?.session;
        if (!session) throw new Error('No active session');

        const userQuestionDataEntities = learningState.userQuestionData?.entities || {};
        const userQuestionData = Object.values(userQuestionDataEntities)
            .filter((uqd): uqd is any => !!uqd)
            .map(uqd => {
                const instance = new UserQuestionData(uqd.userId, uqd.questionId);
                return Object.assign(instance, uqd);
            });

        const answeredIds = Object.keys(session.answers);
        const nextSubsetIds = learningService.getTopKQuestionsForSession(session.allQuestionIds, userQuestionData, subsetSize, 1.0, answeredIds);

        return nextSubsetIds;
    }
);

export const generateRecommendations = createAsyncThunk(
  'learningSession/generateRecommendations',
  async (_, { getState }) => {
    const state = getState() as any;
    const learningState = state.learning || state;
    const userQuestionDataEntities = learningState.userQuestionData?.entities || {};
    const userQuestionData = Object.values(userQuestionDataEntities)
        .filter((uqd): uqd is any => !!uqd)
        .map(uqd => {
            const instance = new UserQuestionData(uqd.userId, uqd.questionId);
            return Object.assign(instance, uqd);
        });

    const allQuestionIds = Array.from({ length: 20 }, (_, i) => String(i + 1)); // This should ideally come from a questions slice
    const categories = Object.values(learningState.categories?.entities || {}).filter(Boolean);
    const questionRecommendations = learningService.getTopKQuestionRecommendations(allQuestionIds, userQuestionData, 3);
    const categoryRecommendations = learningService.getCategoryRecommendations(categories as any[], userQuestionData);
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

      .addCase(hydrateLearningSession.fulfilled, (state, action) => {
        if (action.payload) state.session = action.payload;

      })
      .addCase(startNewSession.fulfilled, (state, action) => {
        state.session = action.payload;
      })
      .addCase(processAnswerAndUpdate.fulfilled, (state, action) => {
          if (state.session) {
            const { questionId, answer, isCorrect, batchesNeeded } = action.payload;
            state.session.answers[questionId] = { answer, isCorrect };
            state.session.currentQuestionIndex++;
            if (batchesNeeded > state.session.feedbackBatchesGenerated) {
                state.session.feedbackBatchesGenerated = batchesNeeded;
            }
          }
      })
      .addCase(nextSubset.fulfilled, (state, action) => {
          if (state.session) {
              state.session.questionIds = action.payload;
              state.session.subsetHistory.push(action.payload);
              state.session.currentQuestionIndex = 0;
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
