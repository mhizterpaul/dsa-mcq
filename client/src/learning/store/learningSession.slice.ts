import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { LearningSession } from './primitives/LearningSession';
import { startNewSession as startNewSessionService, getTopKQuestionRecommendations, getCategoryRecommendations, processAnswer, compileSessionSummary } from '../services/learningService';
import { RootState } from '../../mediator/store/rootReducer';
import { UserQuestionData } from './primitives/UserQuestionData';
import { setUserQuestionData } from './userQuestionData.slice';

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

export const startNewSession = createAsyncThunk(
    'learningSession/startNewSession',
    async ({ userId, allQuestionIds, subsetSize }: { userId: string, allQuestionIds: string[], subsetSize: number }, { getState }) => {
        const state = getState() as RootState;
        const userQuestionData = Object.values(state.learning.userQuestionData.entities).filter(Boolean) as UserQuestionData[];
        const newSession = startNewSessionService(userId, allQuestionIds, userQuestionData, subsetSize);
        return newSession;
    }
);

export const processAnswerAndUpdate = createAsyncThunk(
    'learningSession/processAnswer',
    async ({ questionId, answer, isCorrect, quality, techniqueIds }: { questionId: string, answer: string, isCorrect: boolean, quality: number, techniqueIds?: string[] }, { getState, dispatch }) => {
        const state = getState() as RootState;
        const uqd = state.learning.userQuestionData.entities[questionId];
        if (uqd) {
            const updatedUqd = processAnswer(uqd, isCorrect, quality, techniqueIds);
            dispatch(setUserQuestionData(updatedUqd));
        }
        return { questionId, answer, isCorrect };
    }
);

export const endCurrentSession = createAsyncThunk(
    'learningSession/endCurrentSession',
    async (_, { getState }) => {
        const state = getState() as RootState;
        const session = state.learning.learningSession.session;
        if (session) {
            const summary = compileSessionSummary(session.answers);
            return summary;
        }
        return { strengths: [], weaknesses: [] };
    }
);


export const generateRecommendations = createAsyncThunk(
  'learningSession/generateRecommendations',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userQuestionData = Object.values(state.learning.userQuestionData.entities).filter(Boolean) as UserQuestionData[];
    const categories = Object.values(state.learning.categories.entities).filter(Boolean);

    const questionRecommendations = getTopKQuestionRecommendations(userQuestionData, 3);
    const categoryRecommendations = getCategoryRecommendations(categories);

    return {
      questions: questionRecommendations,
      categories: categoryRecommendations,
    };
  }
);

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
      .addCase(generateRecommendations.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(generateRecommendations.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.recommendations = action.payload;
      })
      .addCase(generateRecommendations.rejected, (state) => {
        state.loading = 'failed';
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
      });
  },
});

export const {
  clearSession,
} = learningSessionSlice.actions;

export default learningSessionSlice.reducer;
