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

        // This is a simplified example. A real implementation would have historical data.
        const historicalData = {
            avg_response_time_ms: [100, 110, 105],
            'Low Improvement Rate (%)': [10, 12, 11],
        };

        for (const metricId in devOpsMetrics) {
            const metric = devOpsMetrics[metricId];
            if (metric && historicalData[metricId]) {
                const anomaly = analyticsService.detectAnomalies(metricId, historicalData[metricId], metric.value, 'performance');
                if (anomaly) {
                    dispatch(addAnomaly({ id: anomaly.id, metricId: anomaly.metricId, type: anomaly.type, deviation: anomaly.deviation }));
                }
            }
        }

        for (const kpiId in engagementKPIs) {
            const kpi = engagementKPIs[kpiId];
            if (kpi && historicalData[kpiId]) {
                const anomaly = analyticsService.detectAnomalies(kpiId, historicalData[kpiId], kpi.value, 'engagement');
                if (anomaly) {
                    dispatch(addAnomaly({ id: anomaly.id, metricId: anomaly.metricId, type: anomaly.type, deviation: anomaly.deviation }));
                }
            }
        }
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
