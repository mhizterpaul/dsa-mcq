export interface IAnalyticsComponent {
  loadTelemetryData(): void;
  computeKpis(): void;
  renderDashboard(): void;
}

export class AnalyticsComponent implements IAnalyticsComponent {
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
