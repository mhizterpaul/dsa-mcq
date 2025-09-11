export class Insight {
  id: string;
  anomalyId: string;
  recommendation: string;

  constructor(id: string, anomalyId: string, recommendation: string) {
    this.id = id;
    this.anomalyId = anomalyId;
    this.recommendation = recommendation;
  }
}
