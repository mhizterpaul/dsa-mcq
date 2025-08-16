import { createSlice, createEntityAdapter, PayloadAction, createAsyncThunk, Update } from '@reduxjs/toolkit';
import { Question } from './primitives/Question';
import { generateBatchFeedback, Feedback } from '../services/feedbackService';
import { LearningRootState } from '.';

// --- ENTITY ADAPTER ---
const questionsAdapter = createEntityAdapter<Question>({
  selectId: (question) => question.id,
});

// --- ASYNC THUNKS ---

export const fetchBatchFeedback = createAsyncThunk<Record<string, Feedback>, string[]>(
  'questions/fetchBatchFeedback',
  async (questionIds, { getState }) => {
    const state = getState() as LearningRootState;
    const questionsToFetch: Question[] = [];

    for (const id of questionIds) {
      const question = state.questions.entities[id];
      // Only fetch feedback if we don't have it or it's a placeholder/error
      if (question && (!question.feedback || question.feedback.correct_approach.includes('Error'))) {
        questionsToFetch.push(question);
      }
    }

    if (questionsToFetch.length > 0) {
      const feedbackMap = await generateBatchFeedback(questionsToFetch);
      return feedbackMap;
    }

    return {};
  }
);

// --- SLICE DEFINITION ---
const questionSlice = createSlice({
  name: 'questions',
  initialState: questionsAdapter.getInitialState(),
  reducers: {
    addQuestion: questionsAdapter.addOne,
    addQuestions: questionsAdapter.addMany,
    updateQuestion: questionsAdapter.updateOne,
    removeQuestion: questionsAdapter.removeOne,
    setQuestions: questionsAdapter.setAll,
    // Reducer to update feedback for a single question if needed elsewhere
    updateFeedback: (state, action: PayloadAction<{ questionId: string; feedback: Feedback }>) => {
        questionsAdapter.updateOne(state, {
            id: action.payload.questionId,
            changes: { feedback: action.payload.feedback },
        });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBatchFeedback.fulfilled, (state, action: PayloadAction<Record<string, Feedback>>) => {
      const updates: Update<Question>[] = Object.entries(action.payload).map(([id, feedback]) => ({
        id,
        changes: { feedback },
      }));
      questionsAdapter.updateMany(state, updates);
    });
  },
});

export const {
  addQuestion,
  addQuestions,
  updateQuestion,
  removeQuestion,
  setQuestions,
  updateFeedback,
} = questionSlice.actions;

export default questionSlice.reducer;
