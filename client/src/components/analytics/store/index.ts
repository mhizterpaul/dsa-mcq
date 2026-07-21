import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Mediator } from '../../mediator/interface';

import devOpsMetricsReducer from './devOpsMetrics.slice';
import engagementKPIsReducer from '../../engagement/store/engagementKPIs.slice';
import anomaliesReducer from './anomalies.slice';
import insightsReducer from './insights.slice';
import usageAnalyticsReducer from './usageAnalytics.slice';

const analyticsRootReducer = combineReducers({
    devOpsMetrics: devOpsMetricsReducer,
    engagementKPIs: engagementKPIsReducer,
    anomalies: anomaliesReducer,
    insights: insightsReducer,
    usageAnalytics: usageAnalyticsReducer,
});

const store = configureStore({
  reducer: analyticsRootReducer,
});

export type AnalyticsRootState = ReturnType<typeof analyticsRootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
