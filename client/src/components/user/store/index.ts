import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Mediator } from '../../mediator/interface';

import userReducer from './user.slice';
import userProfileReducer from './userProfile.slice';
import userInsightReducer from './userInsight.slice';

export const rootReducer = combineReducers({
    user: userReducer,
    profile: userProfileReducer,
    insight: userInsightReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export type UserRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
