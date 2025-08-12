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
