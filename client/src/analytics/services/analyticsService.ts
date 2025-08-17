import { Anomaly, AnomalyType, AnomalySeverity } from '../store/primitives/Anomaly';
import { sqliteService } from '../../common/services/sqliteService';

class AnalyticsService {

    private async saveAnomaly(anomaly: Anomaly) {
        const anomalyToSave = {
            id: anomaly.id,
            metricId: anomaly.metricId,
            type: anomaly.type,
            severity: anomaly.severity,
            timestamp: anomaly.timestamp,
            deviation: anomaly.deviation,
            evidence: JSON.stringify(anomaly.evidence),
            is_dirty: 1,
        };
        await sqliteService.create('anomalies', anomalyToSave);
    }

    // --- Native-dependent checks (Scaffolded/Mocked) ---

    public async checkAuthenticity(): Promise<void> {
        console.warn("Native check 'checkAuthenticity' is mocked.");
        // In a real app, this would call a native module.
        const isTampered = false; // Mocked result
        if (isTampered) {
            const anomaly = new Anomaly({
                type: AnomalyType.AUTHENTICITY,
                severity: AnomalySeverity.CRITICAL,
                evidence: [{ message: 'App signature mismatch detected.' }]
            });
            this.saveAnomaly(anomaly);
        }
    }

    public async checkResourceDeficiency(): Promise<void> {
        console.warn("Native check 'checkResourceDeficiency' is mocked.");
        // Mocked result
        const lowMemory = false;
        if (lowMemory) {
            const anomaly = new Anomaly({
                type: AnomalyType.RESOURCE_DEFICIENCY,
                severity: AnomalySeverity.HIGH,
                evidence: [{ message: 'Device memory is critically low.' }]
            });
            this.saveAnomaly(anomaly);
        }
    }

    // --- JS/TS-based checks ---

    public async checkSecurityBreach(/* mediator state needed here */): Promise<void> {
        // This check requires state from the mediator (e.g., session info)
        // For now, this is a placeholder.
    }

    public async checkApiAbnormality(/* event stream needed here */): Promise<void> {
        // This requires tracking API call frequency.
        // Our fetch wrapper could be extended to log this, and this service
        // would then analyze the logs from the DB.
    }

    public async checkGameplayFraud(/* session data needed here */): Promise<void> {
        // This requires quiz session data (e.g., completion time).
    }


    public runAllChecks() {
        // This would be called periodically by the mediator
        console.log("Running all anomaly checks...");
        this.checkAuthenticity();
        this.checkResourceDeficiency();
        this.checkSecurityBreach();
        this.checkApiAbnormality();
        this.checkGameplayFraud();
    }
}

export const analyticsService = new AnalyticsService();
