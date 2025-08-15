import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
  createAsyncThunk,
  Update,
} from '@reduxjs/toolkit';
import { UserQuestionData } from './primitives/UserQuestionData';
import { sqliteService } from '../../common/services/sqliteService';
import { updateSM2Data as sm2UpdateService } from '../services/learningService';

// --- UTILITY FUNCTIONS FOR DB ---
const stringifyUqd = (uqd: UserQuestionData) => ({
  ...uqd,
  id: `${uqd.userId}-${uqd.questionId}`, // Ensure composite key is set as ID
  techniqueTransferScores: JSON.stringify(uqd.techniqueTransferScores),
  sm2: JSON.stringify(uqd.sm2),
  is_dirty: 1,
});

const parseUqd = (dbUqd: any): UserQuestionData => {
  const uqd = new UserQuestionData(dbUqd.userId, dbUqd.questionId);
  return Object.assign(uqd, {
    ...dbUqd,
    techniqueTransferScores: JSON.parse(dbUqd.techniqueTransferScores || '{}'),
    sm2: JSON.parse(dbUqd.sm2 || '{}'),
  });
};

// --- ENTITY ADAPTER ---
const userQuestionDataAdapter = createEntityAdapter<UserQuestionData>({
  selectId: (uqd) => `${uqd.userId}-${uqd.questionId}`,
});

// --- ASYNC THUNKS ---

export const hydrateUserQuestionData = createAsyncThunk<UserQuestionData[]>(
  'userQuestionData/hydrate',
  async () => {
    const data = await sqliteService.getAll('user_question_data');
    return data.map(parseUqd);
  },
);

export const addUserQuestionDataDb = createAsyncThunk<
  UserQuestionData,
  { userId: string; questionId: string }
>('userQuestionData/add', async ({ userId, questionId }) => {
  const newUserQuestionData = new UserQuestionData(userId, questionId);
  await sqliteService.create('user_question_data', stringifyUqd(newUserQuestionData));
  return newUserQuestionData;
});

export const answerCorrectlyDb = createAsyncThunk<
  UserQuestionData,
  { userId: string; questionId: string; techniqueIds?: string[] }
>('userQuestionData/answerCorrectly', async ({ userId, questionId, techniqueIds }) => {
  const id = `${userId}-${questionId}`;
  const existingData = await sqliteService.getById('user_question_data', id);
  const uqd = existingData ? parseUqd(existingData) : new UserQuestionData(userId, questionId);
  uqd.updateRecallOnCorrectAnswer(techniqueIds);
  await sqliteService.update('user_question_data', id, stringifyUqd(uqd));
  return uqd;
});

export const answerIncorrectlyDb = createAsyncThunk<
  UserQuestionData,
  { userId: string; questionId: string; techniqueIds?: string[] }
>('userQuestionData/answerIncorrectly', async ({ userId, questionId, techniqueIds }) => {
    const id = `${userId}-${questionId}`;
    const existingData = await sqliteService.getById('user_question_data', id);
    const uqd = existingData ? parseUqd(existingData) : new UserQuestionData(userId, questionId);
    uqd.updateRecallOnIncorrectAnswer(techniqueIds);
    await sqliteService.update('user_question_data', id, stringifyUqd(uqd));
    return uqd;
});

export const updateUserQuestionSM2DataDb = createAsyncThunk<
  UserQuestionData,
  { userId: string; questionId: string; quality: number }
>('userQuestionData/updateSm2', async ({ userId, questionId, quality }) => {
    const id = `${userId}-${questionId}`;
    const existingData = await sqliteService.getById('user_question_data', id);
    const uqd = existingData ? parseUqd(existingData) : new UserQuestionData(userId, questionId);
    uqd.sm2 = sm2UpdateService(uqd.sm2, quality);
    await sqliteService.update('user_question_data', id, stringifyUqd(uqd));
    return uqd;
});


// --- SLICE DEFINITION ---
const userQuestionDataSlice = createSlice({
  name: 'userQuestionData',
  initialState: userQuestionDataAdapter.getInitialState(),
  reducers: {
    // Direct state manipulation can still be done if needed, but DB thunks are preferred
    setUserQuestionData: userQuestionDataAdapter.setOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateUserQuestionData.fulfilled, (state, action) => {
        userQuestionDataAdapter.setAll(state, action.payload);
      })
      .addCase(addUserQuestionDataDb.fulfilled, (state, action) => {
        userQuestionDataAdapter.addOne(state, action.payload);
      })
      .addCase(answerCorrectlyDb.fulfilled, (state, action) => {
        userQuestionDataAdapter.upsertOne(state, action.payload);
      })
      .addCase(answerIncorrectlyDb.fulfilled, (state, action) => {
        userQuestionDataAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateUserQuestionSM2DataDb.fulfilled, (state, action) => {
        userQuestionDataAdapter.upsertOne(state, action.payload);
      });
  },
});

export const { setUserQuestionData } = userQuestionDataSlice.actions;

export default userQuestionDataSlice.reducer;
