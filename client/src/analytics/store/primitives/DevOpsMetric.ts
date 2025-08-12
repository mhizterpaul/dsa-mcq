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
