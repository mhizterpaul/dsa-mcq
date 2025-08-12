import { configureStore, combineReducers } from '@reduxjs/toolkit';

import userEngagementReducer from './userEngagement.slice';
import notificationReducer from './notification.slice';

export const engagementRootReducer = combineReducers({
  userEngagement: userEngagementReducer,
  notifications: notificationReducer,
});

const store = configureStore({
  reducer: engagementRootReducer,
});

export type EngagementRootState = ReturnType<typeof engagementRootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
