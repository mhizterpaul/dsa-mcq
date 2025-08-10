export interface DevOpsMetric {
  id: string; // e.g., 'avg_response_time_ms'
  value: number;
  timestamp: number;
}

export interface EngagementKPI {
  id: string; // e.g., 'AvgSessionLength'
  value: number;
  timestamp: number;
}

export interface Anomaly {
  id: string;
  metricId: string;
  type: 'performance' | 'engagement';
  timestamp: number;
  deviation: number;
}

export interface Insight {
  id: string;
  anomalyId: string;
  recommendation: string;
  timestamp: number;
}
