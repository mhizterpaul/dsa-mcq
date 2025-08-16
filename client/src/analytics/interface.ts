

export interface IAnalyticsComponent {
  loadTelemetryData(): void;
  computeTelemetry(): void;
}

export class AnalyticsComponent implements IAnalyticsComponent {
    loadTelemetryData() {
        console.log("Loading telemetry data...");
    }

    computeTelemetry() {
        console.log("Computing KPIs...");
    }

}
