import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Question } from '../interface';

const questionsAdapter = createEntityAdapter<Question>({
  selectId: (question) => question.id,
});

const questionSlice = createSlice({
  name: 'questions',
  initialState: questionsAdapter.getInitialState(),
  reducers: {
    addQuestion: questionsAdapter.addOne,
    addQuestions: questionsAdapter.addMany,
    updateQuestion: questionsAdapter.updateOne,
    removeQuestion: questionsAdapter.removeOne,
    setQuestions: questionsAdapter.setAll,
  },
});

export const {
  addQuestion,
  addQuestions,
  updateQuestion,
  removeQuestion,
  setQuestions,
} = questionSlice.actions;

export default questionSlice.reducer;
