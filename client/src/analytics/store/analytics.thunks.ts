import { createAsyncThunk } from '@reduxjs/toolkit';
import * as analyticsService from '../services/analyticsService';
import { addDevOpsMetric } from './devOpsMetrics.slice';
import { addEngagementKPI } from './engagementKPIs.slice';
import { addAnomaly } from './anomalies.slice';
import { addInsight } from './insights.slice';
import { RootState } from '../../mediator/store/rootReducer';

export const runDevOpsMetricAggregation = createAsyncThunk(
    'analytics/runDevOpsMetricAggregation',
    async (_, { dispatch }) => {
        const metrics = analyticsService.aggregateDevOpsMetrics();
        metrics.forEach(metric => {
            dispatch(addDevOpsMetric({ id: metric.id, value: metric.value }));
        });
    }
);

export const runEngagementKPIComputation = createAsyncThunk(
    'analytics/runEngagementKPIComputation',
    async (_, { dispatch }) => {
        const kpis = analyticsService.computeEngagementKPIs();
        kpis.forEach(kpi => {
            dispatch(addEngagementKPI({ id: kpi.id, value: kpi.value }));
        });
    }
);

export const runAnomalyDetection = createAsyncThunk(
    'analytics/runAnomalyDetection',
    async (_, { getState, dispatch }) => {
        const state = getState() as RootState;
        const devOpsMetrics = state.analytics.devOpsMetrics.entities;
        const engagementKPIs = state.analytics.engagementKPIs.entities;

        const anomalies = analyticsService.detectAnomaliesForMetrics(devOpsMetrics, engagementKPIs);
        anomalies.forEach(anomaly => {
            dispatch(addAnomaly({ id: anomaly.id, metricId: anomaly.metricId, type: anomaly.type, deviation: anomaly.deviation }));
        });
    }
);

export const runInsightGeneration = createAsyncThunk(
    'analytics/runInsightGeneration',
    async (_, { getState, dispatch }) => {
        const state = getState() as RootState;
        const anomalies = Object.values(state.analytics.anomalies.entities).filter(Boolean);
        const insights = analyticsService.generateInsights(anomalies);
        insights.forEach(insight => {
            dispatch(addInsight({ id: insight.id, anomalyId: insight.anomalyId, recommendation: insight.recommendation }));
        });
    }
);
