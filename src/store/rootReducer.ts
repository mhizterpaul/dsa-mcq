import { combineReducers } from '@reduxjs/toolkit';
import learningReducer from '../learning/store/category.slice'; // This is not correct, should be a combined reducer for learning
import engagementReducer from '../engagement/store/notification.slice'; // This is not correct
import userReducer from '../user/store/user.slice';
import analyticsReducer from '../analytics/store/anomalies.slice'; // This is not correct
import sharedStateReducer from '../mediator/store/sharedState.slice';

// I need to combine the reducers from each component first
// For now, I will create a combined reducer for each component in their respective store/index.ts

// I will create the component level combined reducers first.
// Let's start with learning
import categoryReducer from '../learning/store/category.slice';
import questionReducer from '../learning/store/question.slice';
import userQuestionDataReducer from '../learning/store/userQuestionData.slice';
import learningSessionReducer from '../learning/store/learningSession.slice';

const learningRootReducer = combineReducers({
  categories: categoryReducer,
  questions: questionReducer,
  userQuestionData: userQuestionDataReducer,
  learningSession: learningSessionReducer,
});

// Engagement
import userEngagementReducer from '../engagement/store/userEngagement.slice';
import notificationReducer from '../engagement/store/notification.slice';

const engagementRootReducer = combineReducers({
  userEngagement: userEngagementReducer,
  notifications: notificationReducer,
});

// Analytics
import devOpsMetricsReducer from '../analytics/store/devOpsMetrics.slice';
import engagementKPIsReducer from '../analytics/store/engagementKPIs.slice';
import anomaliesReducer from '../analytics/store/anomalies.slice';
import insightsReducer from '../analytics/store/insights.slice';

const analyticsRootReducer = combineReducers({
    devOpsMetrics: devOpsMetricsReducer,
    engagementKPIs: engagementKPIsReducer,
    anomalies: anomaliesReducer,
    insights: insightsReducer,
});


const rootReducer = combineReducers({
  learning: learningRootReducer,
  engagement: engagementRootReducer,
  user: userReducer,
  analytics: analyticsRootReducer,
  mediator: sharedStateReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
