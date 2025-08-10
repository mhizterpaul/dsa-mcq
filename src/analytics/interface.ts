// Data Entities
export class DevOpsMetric {
  id: string;
  value: number;
  timestamp: number;

  constructor(id: string, value: number) {
    this.id = id;
    this.value = value;
    this.timestamp = Date.now();
  }
}

export class EngagementKPI {
  id: string;
  value: number;
  timestamp: number;

  constructor(id: string, value: number) {
    this.id = id;
    this.value = value;
    this.timestamp = Date.now();
  }
}

export class Anomaly {
  id: string;
  metricId: string;
  type: 'performance' | 'engagement';
  timestamp: number;
  deviation: number;

  constructor(id: string, metricId: string, type: 'performance' | 'engagement', deviation: number) {
    this.id = id;
    this.metricId = metricId;
    this.type = type;
    this.timestamp = Date.now();
    this.deviation = deviation;
  }
}

export class Insight {
  id: string;
  anomalyId: string;
  recommendation: string;
  timestamp: number;

  constructor(id: string, anomalyId: string, recommendation: string) {
    this.id = id;
    this.anomalyId = anomalyId;
    this.recommendation = recommendation;
    this.timestamp = Date.now();
  }
}

// Component Contract
export class AnalyticsComponent {
    loadTelemetryData() {
        console.log("Loading telemetry data...");
    }

    computeKpis() {
        console.log("Computing KPIs...");
    }

    renderDashboard() {
        console.log("Rendering dashboard...");
    }
}
