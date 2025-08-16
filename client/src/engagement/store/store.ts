import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Mediator } from '../../mediator/interface';

import userEngagementReducer from './userEngagement.slice';
import notificationReducer from './notification.slice';
import globalEngagementReducer from './globalEngagement.slice';

export const engagementRootReducer = combineReducers({
  userEngagement: userEngagementReducer,
  notifications: notificationReducer,
  globalEngagement: globalEngagementReducer,
});

const store = configureStore({
  reducer: engagementRootReducer,
});

export type EngagementRootState = ReturnType<typeof engagementRootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
