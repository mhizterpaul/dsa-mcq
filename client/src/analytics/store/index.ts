import { configureStore, combineReducers } from '@reduxjs/toolkit';

import devOpsMetricsReducer from './devOpsMetrics.slice';
import engagementKPIsReducer from '../../engagement/store/engagementKPIs.slice';
import anomaliesReducer from './anomalies.slice';
import insightsReducer from './insights.slice';

const analyticsRootReducer = combineReducers({
    devOpsMetrics: devOpsMetricsReducer,
    engagementKPIs: engagementKPIsReducer,
    anomalies: anomaliesReducer,
    insights: insightsReducer,
});

const store = configureStore({
  reducer: analyticsRootReducer,
});

export type AnalyticsRootState = ReturnType<typeof analyticsRootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
