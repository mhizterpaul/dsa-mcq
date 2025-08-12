import { configureStore, combineReducers } from '@reduxjs/toolkit';

import categoryReducer from './category.slice';
import questionReducer from './question.slice';
import userQuestionDataReducer from './userQuestionData.slice';
import learningSessionReducer from './learningSession.slice';

export const learningRootReducer = combineReducers({
  categories: categoryReducer,
  questions: questionReducer,
  userQuestionData: userQuestionDataReducer,
  learningSession: learningSessionReducer,
});

const store = configureStore({
  reducer: learningRootReducer,
});

export type LearningRootState = ReturnType<typeof learningRootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
