import React from 'react';
import UserAnalytics from './components/UserAnalytics';

export interface IAnalyticsComponent {
  loadTelemetryData(): void;
  computeKpis(): void;
  renderDashboard(): void;
  renderUserAnalytics(screen: string): React.ReactElement;
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

    renderUserAnalytics(screen: string): React.ReactElement {
        return <UserAnalytics />;
    }
}
