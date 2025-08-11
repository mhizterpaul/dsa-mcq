import { DevOpsMetric } from '../store/primitives/DevOpsMetric';
import { EngagementKPI } from '../store/primitives/EngagementKPI';
import { Anomaly } from '../store/primitives/Anomaly';
import { Insight } from '../store/primitives/Insight';

// Mock raw data for demonstration purposes
const mockDevOpsTelemetry = {
  requests: [
    { endpoint: '/api/v1/questions', responseTime: 120, hasError: false },
    { endpoint: '/api/v1/questions', responseTime: 150, hasError: false },
    { endpoint: '/api/v1/login', responseTime: 200, hasError: true },
  ],
  system: {
    cpuUsage: [0.5, 0.6, 0.55],
    memoryUsage: [256, 260, 258],
    uptime: [0.999, 0.998, 0.999],
  },
};

const mockEngagementTelemetry = {
  total_session_time: 3600, // seconds
  total_sessions: 100,
  total_correct_recall: 800,
  total_recall_attempts: 1000,
  total_feedback_views: 200,
  total_questions_attempted: 1000,
  position_changes: [1, -2, 0, 3],
  users_with_low_improvement: 5,
  total_active_users: 100,
  users_returned_within_period: 80,
  total_users_in_cohort: 100,
};

// Helper functions for statistics
const calculateMean = (data: number[]): number => data.reduce((a, b) => a + b, 0) / data.length;
const calculateStdDev = (data: number[], mean: number): number => {
  const variance = data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
};

export const aggregateDevOpsMetrics = (): DevOpsMetric[] => {
  const metrics: DevOpsMetric[] = [];

  const avgResponseTime = calculateMean(mockDevOpsTelemetry.requests.map(r => r.responseTime));
  metrics.push(new DevOpsMetric('avg_response_time_ms', avgResponseTime));

  const errorRate = mockDevOpsTelemetry.requests.filter(r => r.hasError).length / mockDevOpsTelemetry.requests.length;
  metrics.push(new DevOpsMetric('error_rate_percent', errorRate * 100));

  const avgCpuUsage = calculateMean(mockDevOpsTelemetry.system.cpuUsage);
  metrics.push(new DevOpsMetric('cpu_usage_percent', avgCpuUsage * 100));

  const avgMemoryUsage = calculateMean(mockDevOpsTelemetry.system.memoryUsage);
  metrics.push(new DevOpsMetric('memory_usage_mb', avgMemoryUsage));

  const uptimePercent = calculateMean(mockDevOpsTelemetry.system.uptime);
  metrics.push(new DevOpsMetric('uptime_percent', uptimePercent * 100));

  return metrics;
};

export const computeEngagementKPIs = (): EngagementKPI[] => {
    const kpis: EngagementKPI[] = [];

    kpis.push(new EngagementKPI('Avg Session Length', mockEngagementTelemetry.total_session_time / mockEngagementTelemetry.total_sessions));
    kpis.push(new EngagementKPI('Avg Recall Accuracy', mockEngagementTelemetry.total_correct_recall / mockEngagementTelemetry.total_recall_attempts));
    kpis.push(new EngagementKPI('Avg Feedback View Rate', mockEngagementTelemetry.total_feedback_views / mockEngagementTelemetry.total_questions_attempted));
    kpis.push(new EngagementKPI('Avg Leaderboard Position Δ', calculateMean(mockEngagementTelemetry.position_changes)));
    kpis.push(new EngagementKPI('Low Improvement Rate (%)', (mockEngagementTelemetry.users_with_low_improvement / mockEngagementTelemetry.total_active_users) * 100));
    kpis.push(new EngagementKPI('Return Rate (%)', (mockEngagementTelemetry.users_returned_within_period / mockEngagementTelemetry.total_users_in_cohort) * 100));

    return kpis;
};

export const detectAnomalies = (
    metricId: string,
    historicalData: number[],
    currentValue: number,
    type: 'performance' | 'engagement'
): Anomaly | null => {
    const mean = calculateMean(historicalData);
    const stdDev = calculateStdDev(historicalData, mean);
    const deviation = (currentValue - mean) / stdDev;

    if (Math.abs(deviation) > 3) {
        return new Anomaly(`anomaly-${metricId}-${Date.now()}`, metricId, type, deviation);
    }
    return null;
};

export const detectAnomaliesForMetrics = (
    devOpsMetrics: { [id: string]: DevOpsMetric },
    engagementKPIs: { [id: string]: EngagementKPI }
): Anomaly[] => {
    const anomalies: Anomaly[] = [];
    const historicalData = {
        avg_response_time_ms: [100, 110, 105],
        'Low Improvement Rate (%)': [10, 12, 11],
    };

    for (const metricId in devOpsMetrics) {
        const metric = devOpsMetrics[metricId];
        if (metric && historicalData[metricId]) {
            const anomaly = detectAnomalies(metricId, historicalData[metricId], metric.value, 'performance');
            if (anomaly) {
                anomalies.push(anomaly);
            }
        }
    }

    for (const kpiId in engagementKPIs) {
        const kpi = engagementKPIs[kpiId];
        if (kpi && historicalData[kpiId]) {
            const anomaly = detectAnomalies(kpiId, historicalData[kpiId], kpi.value, 'engagement');
            if (anomaly) {
                anomalies.push(anomaly);
            }
        }
    }

    return anomalies;
}

export const generateInsights = (anomalies: Anomaly[]): Insight[] => {
    const insights: Insight[] = [];

    anomalies.forEach(anomaly => {
        let recommendation = 'No specific recommendation.';
        if (anomaly.type === 'performance' && anomaly.metricId === 'avg_response_time_ms' && anomaly.deviation > 0) {
            recommendation = 'Review service profiling and DB optimization';
        } else if (anomaly.type === 'engagement' && anomaly.metricId === 'Low Improvement Rate (%)' && anomaly.deviation > 0) {
            recommendation = 'Review content adaptation algorithms';
        } else if (anomaly.type === 'engagement' && anomaly.metricId === 'Return Rate (%)' && anomaly.deviation < 0) {
            recommendation = 'Trigger retention strategy review';
        }
        insights.push(new Insight(`insight-${anomaly.id}`, anomaly.id, recommendation));
    });

    return insights;
};
