import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { LearningSession } from './primitives/LearningSession';
import { learningService } from '../services/learningService';
import { LearningRootState } from './store';
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
        const state = getState() as LearningRootState;
        const userQuestionData = Object.values(state.userQuestionData.entities).filter(Boolean) as UserQuestionData[];
        const newSession = learningService.startNewSession(userId, allQuestionIds, userQuestionData, subsetSize);
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
            dispatch(setUserQuestionData(updatedUqd));
        }
        return { questionId, answer, isCorrect };
    }
);

export const endCurrentSession = createAsyncThunk(
    'learningSession/endCurrentSession',
    async (_, { getState }) => {
        const state = getState() as LearningRootState;
        const session = state.learningSession.session;
        if (session) {
            const summary = learningService.compileSessionSummary(session.answers);
            return summary;
        }
        return { strengths: [], weaknesses: [] };
    }
);


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
