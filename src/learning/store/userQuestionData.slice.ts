import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { UserQuestionData } from './primitives/UserQuestionData';
import { updateSM2Data } from '../services/learningService';

const userQuestionDataAdapter = createEntityAdapter<UserQuestionData>({
  selectId: (userQuestionData) => `${userQuestionData.userId}-${userQuestionData.questionId}`,
});

const userQuestionDataSlice = createSlice({
  name: 'userQuestionData',
  initialState: userQuestionDataAdapter.getInitialState(),
  reducers: {
    addUserQuestionData: (state, action: PayloadAction<{ userId: string; questionId: string }>) => {
      const { userId, questionId } = action.payload;
      const newUserQuestionData = new UserQuestionData(userId, questionId);
      userQuestionDataAdapter.addOne(state, { ...newUserQuestionData });
    },
    answerCorrectly: (state, action: PayloadAction<{ userId: string; questionId: string; techniqueIds?: string[] }>) => {
      const { userId, questionId, techniqueIds } = action.payload;
      const id = `${userId}-${questionId}`;
      const existingData = state.entities[id];
      if (existingData) {
        const dataInstance = Object.assign(new UserQuestionData(userId, questionId), existingData);
        dataInstance.updateRecallOnCorrectAnswer(techniqueIds);
        userQuestionDataAdapter.updateOne(state, { id, changes: { ...dataInstance } });
      }
    },
    setSm2Data: (
        state,
        action: PayloadAction<{ userId: string; questionId: string; sm2Data: UserQuestionData['sm2'] }>,
      ) => {
        const { userId, questionId, sm2Data } = action.payload;
        const id = `${userId}-${questionId}`;
        const existingData = state.entities[id];
        if (existingData) {
          userQuestionDataAdapter.updateOne(state, {
            id,
            changes: { sm2: sm2Data },
          });
        }
      },
    setRecallData: (
        state,
        action: PayloadAction<{ userId: string; questionId: string; recallData: Partial<UserQuestionData> }>,
      ) => {
        const { userId, questionId, recallData } = action.payload;
        const id = `${userId}-${questionId}`;
        const existingData = state.entities[id];
        if (existingData) {
          userQuestionDataAdapter.updateOne(state, {
            id,
            changes: recallData,
          });
        }
      },
    setUserQuestionData: (state, action: PayloadAction<UserQuestionData>) => {
        userQuestionDataAdapter.setOne(state, action.payload);
    },
    answerIncorrectly: (state, action: PayloadAction<{ userId: string; questionId: string; techniqueIds?: string[] }>) => {
        const { userId, questionId, techniqueIds } = action.payload;
        const id = `${userId}-${questionId}`;
        const existingData = state.entities[id];
        if (existingData) {
          const dataInstance = Object.assign(new UserQuestionData(userId, questionId), existingData);
          dataInstance.updateRecallOnIncorrectAnswer(techniqueIds);
          userQuestionDataAdapter.updateOne(state, { id, changes: { ...dataInstance } });
        }
      },
    decayRecallStrength: (state, action: PayloadAction<{ userId: string; questionId: string }>) => {
        const { userId, questionId } = action.payload;
        const id = `${userId}-${questionId}`;
        const existingData = state.entities[id];
        if (existingData) {
          const dataInstance = Object.assign(new UserQuestionData(userId, questionId), existingData);
          dataInstance.decayRecallStrength();
          userQuestionDataAdapter.updateOne(state, { id, changes: { ...dataInstance } });
        }
      },
    updateUserQuestionSM2Data: (
      state,
      action: PayloadAction<{ userId: string; questionId: string; quality: number }>,
    ) => {
      const { userId, questionId, quality } = action.payload;
      const id = `${userId}-${questionId}`;
      const existingData = state.entities[id];

      if (existingData) {
        const currentSM2Data = existingData.sm2;
        const updatedSM2Data = updateSM2Data(currentSM2Data, quality);

        userQuestionDataAdapter.updateOne(state, {
          id,
          changes: { sm2: updatedSM2Data },
        });
      }
    },
  },
});

export const {
  addUserQuestionData,
  answerCorrectly,
  setSm2Data,
  setRecallData,
  setUserQuestionData,
  answerIncorrectly,
  decayRecallStrength,
  updateUserQuestionSM2Data,
} = userQuestionDataSlice.actions;

export default userQuestionDataSlice.reducer;
