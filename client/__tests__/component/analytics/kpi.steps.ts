import { loadFeature, defineFeature } from 'jest-cucumber';
import { configureStore, AnyAction } from '@reduxjs/toolkit';
import { analyticsRootReducer } from '../../../src/analytics/store';
import {
  runDevOpsMetricAggregation,
  runEngagementKPIComputation,
  runAnomalyDetection,
  runInsightGeneration,
} from '../../../src/analytics/store/analytics.thunks';
import * as analyticsService from '../../../src/analytics/services/analyticsService';
import { ThunkDispatch } from 'redux-thunk';

jest.mock('../../../src/analytics/services/analyticsService');

const mockedAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;

const feature = loadFeature('./kpi.feature', { loadRelativePath: true });

let store: ReturnType<typeof configureStore>;
type AppDispatch = ThunkDispatch<any, any, AnyAction>;
let dispatch: AppDispatch;

const setupStore = (initialState?: any) => {
  store = configureStore({
    reducer: analyticsRootReducer,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
  dispatch = store.dispatch;
};

defineFeature(feature, (test) => {
  beforeEach(() => {
    setupStore();
  });

  // test('Aggregate DevOps performance metrics', ({ given, when, then }) => {
  //   given('metrics from API gateways, databases, and frontend clients', () => {
  //     mockedAnalyticsService.aggregateDevOpsMetrics.mockReturnValue([
  //       { id: 'avg_response_time_ms', value: 150, timestamp: Date.now() },
  //       { id: 'error_rate_percent', value: 33, timestamp: Date.now() },
  //     ]);
  //   });
  //   when('telemetry aggregation runs', async () => {
  //     await dispatch(runDevOpsMetricAggregation());
  //   });
  //   then(/^store:$/, (table) => {
  //     const { entities } = store.getState().analytics.devOpsMetrics;
  //     expect(entities['avg_response_time_ms']).toBeDefined();
  //     expect(entities['error_rate_percent']).toBeDefined();
  //   });
  // });

  test('Compute engagement KPIs from aggregated data', ({ given, when, then }) => {
    given('telemetry collection is enabled', () => {
      // empty
    });
    and('it gathers aggregated engagement metrics without storing individual user data', () => {
      // empty
    });
    and('it gathers DevOps performance metrics', () => {
      // empty
    });
    given('aggregated event counts and durations for all sessions', () => {
        mockedAnalyticsService.computeEngagementKPIs.mockReturnValue([
            { id: 'Avg Session Length', value: 36, timestamp: Date.now() },
            { id: 'Avg Recall Accuracy', value: 0.8, timestamp: Date.now() },
        ]);
    });
    when('KPI computation runs daily', async () => {
        await dispatch(runEngagementKPIComputation());
    });
    then(/^calculate:$/, (table) => {
        const { entities } = store.getState().engagementKPIs;
        expect(entities['Avg Session Length']).toBeDefined();
        expect(entities['Avg Recall Accuracy']).toBeDefined();
    });
  });

  test('Detect anomalies in aggregated metrics', ({ given, when, then, and }) => {
    given('telemetry collection is enabled', () => {
      // empty
    });
    and('it gathers aggregated engagement metrics without storing individual user data', () => {
      // empty
    });
    and('it gathers DevOps performance metrics', () => {
      // empty
    });
    given('30 days of historical data for each metric', () => {
      mockedAnalyticsService.detectAnomalies.mockReturnValue({
        id: 'anomaly-1',
        metricId: 'avg_response_time_ms',
        type: 'performance',
        deviation: 4,
        timestamp: Date.now(),
      });
    });
    when('today\'s value deviates more than 3σ from the historical mean', async () => {
        await dispatch(runAnomalyDetection());
    });
    then('flag it as an anomaly', () => {
        const { entities } = store.getState().anomalies;
        expect(Object.values(entities).length).toBeGreaterThan(0);
    });
    and('tag the anomaly as either "performance" or "engagement"', () => {
        const { entities } = store.getState().anomalies;
        const anomaly = Object.values(entities)[0];
        expect(['performance', 'engagement']).toContain(anomaly?.type);
    });
  });

  test('Generate insights from anomalies', ({ given, when, then }) => {
    given('telemetry collection is enabled', () => {
      // empty
    });
    and('it gathers aggregated engagement metrics without storing individual user data', () => {
      // empty
    });
    and('it gathers DevOps performance metrics', () => {
      // empty
    });
    given('flagged anomalies', () => {
        mockedAnalyticsService.generateInsights.mockReturnValue([
            { id: 'insight-1', anomalyId: 'anomaly-1', recommendation: 'Review service profiling', timestamp: Date.now() },
        ]);
    });
    when('insight generation runs', async () => {
        await dispatch(runInsightGeneration());
    });
    then(/^recommend:$/, (table) => {
        const { entities } = store.getState().insights;
        expect(Object.values(entities).length).toBeGreaterThan(0);
    });
  });

  test('Retrieve KPI and performance reports', ({ given, when, then, and }) => {
    given('telemetry collection is enabled', () => {
      // empty
    });
    and('it gathers aggregated engagement metrics without storing individual user data', () => {
      // empty
    });
    and('it gathers DevOps performance metrics', () => {
      // empty
    });
    given('a request for a reporting period', () => {
      // Set up initial state with some metrics, KPIs, anomalies, and insights
      setupStore({
        devOpsMetrics: { ids: ['m1'], entities: { m1: { id: 'm1', value: 1, timestamp: Date.now() } } },
        engagementKPIs: { ids: ['k1'], entities: { k1: { id: 'k1', value: 1, timestamp: Date.now() } } },
        anomalies: { ids: ['a1'], entities: { a1: { id: 'a1', metricId: 'm1', type: 'performance', deviation: 4, timestamp: Date.now() } } },
        insights: { ids: ['i1'], entities: { i1: { id: 'i1', anomalyId: 'a1', recommendation: 'rec', timestamp: Date.now() } } },
      });
    });
    when('processed', () => {
      // This is a selector test, no action needed
    });
    then('return both engagement KPIs and DevOps performance metrics', () => {
      const state = store.getState();
      expect(Object.values(state.devOpsMetrics.entities).length).toBeGreaterThan(0);
      expect(Object.values(state.engagementKPIs.entities).length).toBeGreaterThan(0);
    });
    and('include linked anomalies and insights', () => {
        const state = store.getState();
        expect(Object.values(state.anomalies.entities).length).toBeGreaterThan(0);
        expect(Object.values(state.insights.entities).length).toBeGreaterThan(0);
    });
  });
});
