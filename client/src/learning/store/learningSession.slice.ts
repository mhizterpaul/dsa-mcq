import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { LearningSession } from './primitives/LearningSession';
import { learningService } from '../services/learningService';
import { LearningRootState } from '.';
import { UserQuestionData } from './primitives/UserQuestionData';

import { setUserQuestionDataDb } from './userQuestionData.slice'; // Assuming this will be the DB version
import { sqliteService } from '../../common/services/sqliteService';
import { fetchBatchFeedback } from './question.slice'; // To be created in a later step


// --- STATE AND INITIAL STATE ---
interface LearningSessionState {
  session: LearningSession | null;
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
  const session = new LearningSession(dbSession.id, dbSession.userId, JSON.parse(dbSession.allQuestionIds || '[]'));
  return Object.assign(session, {
    ...dbSession,
    questionIds: JSON.parse(dbSession.questionIds || '[]'),
    subsetHistory: JSON.parse(dbSession.subsetHistory || '[]'),
    answers: JSON.parse(dbSession.answers || '{}'),
    summary: JSON.parse(dbSession.summary || '{"strengths":[],"weaknesses":[]}'),
  });
};



// --- ASYNC THUNKS ---

export const hydrateLearningSession = createAsyncThunk<LearningSession | null>(
  'learningSession/hydrate',
  async () => {

    const sessions = await sqliteService.getAll('learning_sessions');
    if (sessions.length > 0) return parseSession(sessions[sessions.length - 1]);

    return null;
  },
);

export const saveSessionDb = createAsyncThunk(
    'learningSession/saveSessionDb',
    async (session: LearningSession) => {

        await sqliteService.create('learning_sessions', stringifySession(session));

        return session;
    }
);

export const startNewSession = createAsyncThunk(
    'learningSession/startNewSession',
    async ({ userId, allQuestionIds, subsetSize }: { userId: string, allQuestionIds: string[], subsetSize: number }, { getState, dispatch }) => {
        const state = getState() as LearningRootState;
        const userQuestionData = Object.values(state.userQuestionData.entities).filter(Boolean) as UserQuestionData[];
        const newSession = learningService.startNewSession(userId, allQuestionIds, userQuestionData, subsetSize);

        dispatch(saveSessionDb(newSession));
        return newSession;
    }
);

export const processAnswerAndUpdate = createAsyncThunk(
    'learningSession/processAnswer',
    async ({ userId, questionId, answer, isCorrect, quality, techniqueIds }: { userId: string, questionId: string, answer: string, isCorrect: boolean, quality: number, techniqueIds?: string[] }, { getState, dispatch }) => {
        const state = getState() as LearningRootState;


        // Update UserQuestionData
        dispatch(setUserQuestionDataDb({ userId, questionId, isCorrect, quality, techniqueIds }));

        // Update session and check for feedback batching
        const currentSession = state.learningSession.session;
        if (currentSession) {
            const answeredCount = Object.keys(currentSession.answers).length + 1; // +1 for the current answer
            const totalQuestions = currentSession.allQuestionIds.length;
            const threshold = Math.max(1, Math.floor(totalQuestions / 4));
            const batchesNeeded = Math.floor(answeredCount / threshold);

            if (batchesNeeded > currentSession.feedbackBatchesGenerated) {
                const startIndex = currentSession.feedbackBatchesGenerated * threshold;
                const endIndex = startIndex + threshold;
                const questionIdsForFeedback = Object.keys(currentSession.answers).slice(startIndex, endIndex);
                // Also include the current question if not already in answers
                if (!questionIdsForFeedback.includes(questionId)) {
                    questionIdsForFeedback.push(questionId);
                }

                // Dispatch action to fetch feedback for this batch
                dispatch(fetchBatchFeedback(questionIdsForFeedback));
            }
        }

        return { questionId, answer, isCorrect, batchesNeeded: batchesNeeded };
    }
);

export const endCurrentSession = createAsyncThunk(/* ... existing implementation ... */);
export const generateRecommendations = createAsyncThunk(/* ... existing implementation ... */);

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
            // Trigger save to DB after state update
            // This could be a separate listener/middleware in a more complex app
            saveSessionDb(state.session);
          }
      })
      .addCase(endCurrentSession.fulfilled, (state, action) => {
          if (state.session) {
              state.session.summary = action.payload;
              state.session.endTime = Date.now();
              saveSessionDb(state.session);
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
