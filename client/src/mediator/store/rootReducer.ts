import { combineReducers } from '@reduxjs/toolkit';

// Learning Component Reducers
import categoryReducer from '../../learning/store/category.slice';
import questionReducer from '../../learning/store/question.slice';
import userQuestionDataReducer from '../../learning/store/userQuestionData.slice';
import learningSessionReducer from '../../learning/store/learningSession.slice';

const learningRootReducer = combineReducers({
  categories: categoryReducer,
  questions: questionReducer,
  userQuestionData: userQuestionDataReducer,
  learningSession: learningSessionReducer,
});

// Engagement Component Reducers
import userEngagementReducer from '../../engagement/store/userEngagement.slice';
import notificationReducer from '../../engagement/store/notification.slice';

const engagementRootReducer = combineReducers({
  userEngagement: userEngagementReducer,
  notifications: notificationReducer,
});

// Analytics Component Reducers
import devOpsMetricsReducer from '../../analytics/store/devOpsMetrics.slice';
import engagementKPIsReducer from '../../engagement/store/engagementKPIs.slice';
import anomaliesReducer from '../../analytics/store/anomalies.slice';
import insightsReducer from '../../analytics/store/insights.slice';

const analyticsRootReducer = combineReducers({
    devOpsMetrics: devOpsMetricsReducer,
    engagementKPIs: engagementKPIsReducer,
    anomalies: anomaliesReducer,
    insights: insightsReducer,
});

// User Component Reducer
import userReducer from '../../user/store/user.slice';

// Mediator Component Reducer
import sharedStateReducer from '../../mediator/store/sharedState.slice';
import adReducer from './ad.slice';

const mediatorRootReducer = combineReducers({
    sharedState: sharedStateReducer,
    ad: adReducer,
});

const rootReducer = combineReducers({
  learning: learningRootReducer,
  engagement: engagementRootReducer,
  user: userReducer,
  analytics: analyticsRootReducer,
  mediator: mediatorRootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
