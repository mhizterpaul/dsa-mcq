import { configureStore, combineReducers } from '@reduxjs/toolkit';

import userEngagementReducer from './userEngagement.slice';
import notificationReducer from './notification.slice';
import achievementsReducer from './achievements.slice';
import dailyQuizReducer from './dailyQuiz.slice';
import leaderboardReducer from './leaderboard.slice';
import motivationReducer from './motivation.slice';
import remindersReducer from './reminders.slice';
import kingOfQuizReducer from './kingOfQuiz.slice';

export const engagementRootReducer = combineReducers({
  userEngagement: userEngagementReducer,
  notifications: notificationReducer,
  achievements: achievementsReducer,
  dailyQuiz: dailyQuizReducer,
  leaderboard: leaderboardReducer,
  motivation: motivationReducer,
  reminders: remindersReducer,
  kingOfQuiz: kingOfQuizReducer,
});

const store = configureStore({
  reducer: engagementRootReducer,
});

export type EngagementRootState = ReturnType<typeof engagementRootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
