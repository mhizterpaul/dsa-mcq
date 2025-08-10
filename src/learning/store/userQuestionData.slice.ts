import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { UserQuestionData } from '../interface';

const userQuestionDataAdapter = createEntityAdapter<UserQuestionData>({
  selectId: (userQuestionData) => `${userQuestionData.userId}-${userQuestionData.questionId}`,
});

const userQuestionDataSlice = createSlice({
  name: 'userQuestionData',
  initialState: userQuestionDataAdapter.getInitialState(),
  reducers: {
    addUserQuestionData: userQuestionDataAdapter.addOne,
    addUserQuestionDataMany: userQuestionDataAdapter.addMany,
    updateUserQuestionData: userQuestionDataAdapter.updateOne,
    removeUserQuestionData: userQuestionDataAdapter.removeOne,
    setUserQuestionData: userQuestionDataAdapter.setAll,
  },
});

export const {
  addUserQuestionData,
  addUserQuestionDataMany,
  updateUserQuestionData,
  removeUserQuestionData,
  setUserQuestionData,
} = userQuestionDataSlice.actions;

export default userQuestionDataSlice.reducer;
