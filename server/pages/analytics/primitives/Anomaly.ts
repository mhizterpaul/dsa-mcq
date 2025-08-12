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
