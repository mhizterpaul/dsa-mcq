import { sqliteService } from '../../common/services/sqliteService';
import { DevOpsMetric, DevOpsMetricType, DevOpsMetricPayload } from '../store/primitives/DevOpsMetric';

class MetricsService {

    private async logMetric(type: DevOpsMetricType, payload: Omit<DevOpsMetricPayload, 'timestamp'>) {
        try {
            const metric = new DevOpsMetric(type, payload);
            // The payload needs to be stringified for the DB
            const metricToSave = {
                id: metric.id,
                type: metric.type,
                payload: JSON.stringify(metric.payload),
                is_dirty: 1,
            };
            await sqliteService.create('devops_metrics', metricToSave);
        } catch (error) {
            console.error(`[MetricsService] Failed to log metric ${type}:`, error);
        }
    }

    public logStartupTime(timeToFirstPrintMs: number) {
        this.logMetric(DevOpsMetricType.APP_STARTUP_TIME, { timeToFirstPrintMs });
    }

    public logHydrationLatency(processName: string, durationMs: number, status: "running" | "completed" | "failed") {
        this.logMetric(DevOpsMetricType.HYDRATION_LATENCY, { processName, durationMs, status });
    }

    public logNetworkRequest(latencyMs: number, throughputKbps: number, packetLossPercent: number) {
        this.logMetric(DevOpsMetricType.NETWORK_CONDITION, { latencyMs, throughputKbps, packetLossPercent });
    }

    public logCrash(error: Error, severity: "critical" = "critical") {
        this.logMetric(DevOpsMetricType.CRASH, {
            errorMessage: error.message,
            stackTrace: error.stack || '',
            severity,
        });
    }

    public logHandledError(errorCode: string, message: string, severity: "low" | "medium" | "high") {
        this.logMetric(DevOpsMetricType.ERROR, { errorCode, message, severity });
    }
}

export const metricsService = new MetricsService();
