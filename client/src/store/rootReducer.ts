import { combineReducers } from '@reduxjs/toolkit';

// Learning Component Reducers
import categoryReducer from '../components/learning/store/category.slice';
import questionReducer from '../components/learning/store/question.slice';
import userQuestionDataReducer from '../components/learning/store/userQuestionData.slice';
import learningSessionReducer from '../components/learning/store/learningSession.slice';

import recentQuizzesReducer from '../components/learning/store/recentQuizzes.slice';

const learningRootReducer = combineReducers({
  categories: categoryReducer,
  questions: questionReducer,
  userQuestionData: userQuestionDataReducer,
  learningSession: learningSessionReducer,
  recentQuizzes: recentQuizzesReducer,
});

// Engagement Component Reducers
import userEngagementReducer from '../components/engagement/store/userEngagement.slice';
import notificationReducer from '../components/engagement/store/notification.slice';

import globalEngagementReducer from '../components/engagement/store/globalEngagement.slice';

const engagementRootReducer = combineReducers({
  userEngagement: userEngagementReducer,
  notifications: notificationReducer,
  globalEngagement: globalEngagementReducer,
});

// Analytics Component Reducers
import devOpsMetricsReducer from '../components/analytics/store/devopsMetrics.slice';
import engagementKPIsReducer from '../components/engagement/store/engagementKPIs.slice';
import anomaliesReducer from '../components/analytics/store/anomalies.slice';
import insightsReducer from '../components/analytics/store/insights.slice';

const analyticsRootReducer = combineReducers({
    devOpsMetrics: devOpsMetricsReducer,
    engagementKPIs: engagementKPIsReducer,
    anomalies: anomaliesReducer,
    insights: insightsReducer,
});

// User Component Reducer
import userReducer from '../components/user/store/user.slice';
import userProfileReducer from '../components/user/store/userProfile.slice';

// Mediator Component Reducer
import sharedStateReducer from './sharedState.slice';
import adReducer from './ad.slice';

const mediatorRootReducer = combineReducers({
    sharedState: sharedStateReducer,
    ad: adReducer,
});

const rootReducer = combineReducers({
  learning: learningRootReducer,
  engagement: engagementRootReducer,
  user: userReducer,
  profile: userProfileReducer,
  analytics: analyticsRootReducer,
  mediator: mediatorRootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
