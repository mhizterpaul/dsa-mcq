import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { UserQuestionData } from '../interface';

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
    answerCorrectly: (state, action: PayloadAction<{ userId: string; questionId: string }>) => {
      const { userId, questionId } = action.payload;
      const id = `${userId}-${questionId}`;
      const existingData = state.entities[id];
      if (existingData) {
        const dataInstance = Object.assign(new UserQuestionData(userId, questionId), existingData);
        dataInstance.updateRecallOnCorrectAnswer();
        userQuestionDataAdapter.updateOne(state, { id, changes: { ...dataInstance } });
      }
    },
    answerIncorrectly: (state, action: PayloadAction<{ userId: string; questionId: string }>) => {
        const { userId, questionId } = action.payload;
        const id = `${userId}-${questionId}`;
        const existingData = state.entities[id];
        if (existingData) {
          const dataInstance = Object.assign(new UserQuestionData(userId, questionId), existingData);
          dataInstance.updateRecallOnIncorrectAnswer();
          userQuestionDataAdapter.updateOne(state, { id, changes: { ...dataInstance } });
        }
      },
  },
});

export const {
  addUserQuestionData,
  answerCorrectly,
  answerIncorrectly,
} = userQuestionDataSlice.actions;

export default userQuestionDataSlice.reducer;
