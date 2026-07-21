import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Anomaly, AnomalyType, AnomalySeverity } from '../store/primitives/Anomaly';
import { sqliteService } from '../../common/services/sqliteService';
import { metricsService } from './metricsService';
import { API_BASE_URL } from '../../../config';

class AnalyticsService {
    private sessionStartTime = Date.now();
    private apiCallTimestamps: number[] = [];
    private visitedScreens: { screen: string; startTime: number; duration: number }[] = [];
    private interactionHeatMap: Record<string, number> = {};
    private currentScreen: string | null = null;
    private currentScreenStartTime = Date.now();

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

    public recordScreenVisit(screenName: string) {
        const now = Date.now();
        if (this.currentScreen) {
            const duration = now - this.currentScreenStartTime;
            this.visitedScreens.push({
                screen: this.currentScreen,
                startTime: this.currentScreenStartTime,
                duration,
            });
        }
        this.currentScreen = screenName;
        this.currentScreenStartTime = now;
    }

    public recordInteraction(componentId: string) {
        this.interactionHeatMap[componentId] = (this.interactionHeatMap[componentId] || 0) + 1;
    }

    public session_analytics = Object.assign(
        () => {
            this.recordScreenVisit(''); // Close the last visited screen
            const sessionDuration = Date.now() - this.sessionStartTime;

            const timeSpentPerPage: Record<string, number> = {};
            const visitCounts: Record<string, number> = {};

            for (const visit of this.visitedScreens) {
                if (visit.screen) {
                    timeSpentPerPage[visit.screen] = (timeSpentPerPage[visit.screen] || 0) + visit.duration;
                    visitCounts[visit.screen] = (visitCounts[visit.screen] || 0) + 1;
                }
            }

            const averageTimeSpentPerPage: Record<string, number> = {};
            for (const screen in timeSpentPerPage) {
                averageTimeSpentPerPage[screen] = timeSpentPerPage[screen] / visitCounts[screen];
            }

            return {
                visitedScreens: this.visitedScreens.map(v => v.screen).filter(Boolean),
                interactionHeatMap: this.interactionHeatMap,
                averageTimeSpentPerPage,
                sessionDuration,
                session_ontime: sessionDuration, // session_ontime merged inside session_analytics
            };
        },
        {
            recordScreenVisit: (screenName: string) => {
                const now = Date.now();
                if (this.currentScreen) {
                    const duration = now - this.currentScreenStartTime;
                    this.visitedScreens.push({
                        screen: this.currentScreen,
                        startTime: this.currentScreenStartTime,
                        duration,
                    });
                }
                this.currentScreen = screenName;
                this.currentScreenStartTime = now;
            },
            recordInteraction: (componentId: string) => {
                this.interactionHeatMap[componentId] = (this.interactionHeatMap[componentId] || 0) + 1;
            }
        }
    );

    public async checkGameplayFraud(): Promise<void> {
        const now = Date.now();
        this.apiCallTimestamps.push(now);
        this.apiCallTimestamps = this.apiCallTimestamps.filter(t => now - t < 5000);

        if (this.apiCallTimestamps.length >= 10) {
            console.warn('[AnalyticsService] Gameplay fraud detected! APIs firing at hyper human speeds.');
            const anomaly = new Anomaly({
                type: AnomalyType.GAMEPLAY_FRAUD,
                severity: AnomalySeverity.HIGH,
                evidence: [{ message: 'APIs firing at hyper human speeds', callCount: this.apiCallTimestamps.length }]
            });
            await this.saveAnomaly(anomaly);
        }
    }

    // Concrete Mobile-Only resource deficiency check using NetInfo and Device RAM size with advanced Constrained Memory & Storage Evaluators
    public async checkResourceDeficiency(): Promise<void> {
        if (Platform.OS === 'web') {
            return; // Skip on web client as requested
        }

        const MIN_BANDWIDTH_KBPS = (typeof process !== 'undefined' && process.env?.MIN_BANDWIDTH_KBPS)
            ? parseInt(process.env.MIN_BANDWIDTH_KBPS, 10)
            : 1000;

        const MAX_PING_MS = (typeof process !== 'undefined' && process.env?.MAX_PING_MS)
            ? parseInt(process.env.MAX_PING_MS, 10)
            : 150;

        const netState = await NetInfo.fetch();
        let isConstrained = false;
        const evidence: any[] = [];

        // Check network constraints
        if (!netState.isConnected) {
            isConstrained = true;
            evidence.push({ message: 'No active internet connection.' });
        } else if (netState.type === 'cellular' && (netState.details as any).cellularGeneration === '2g') {
            isConstrained = true;
            evidence.push({ message: 'Low network bandwidth (2G detected)', threshold: MIN_BANDWIDTH_KBPS });
        }

        // Check latency (Ping above 150ms should be considered high latency and captured)
        // Measured against a host server endpoint
        let currentPing = 0;
        const pingStart = Date.now();
        try {
            await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
            currentPing = Date.now() - pingStart;
        } catch (error) {
            currentPing = 999; // Fallback to high value if request fails
        }

        if (currentPing > MAX_PING_MS) {
            isConstrained = true;
            evidence.push({ message: `High network latency detected: ${currentPing}ms`, limit: MAX_PING_MS });
        }

        // --- 1. Constrained Memory (RAM) Evaluator ---
        // Formula: safe os operating conditions + estimated os operational data + program installed * average_size(configurable) + estimated user data size(configurable) - total memory below safe limits for loaded apps in ram
        const safeOsLimitGb = (typeof process !== 'undefined' && process.env?.SAFE_OS_LIMIT_GB)
            ? parseFloat(process.env.SAFE_OS_LIMIT_GB)
            : 1.0;

        const estimatedOsDataGb = (typeof process !== 'undefined' && process.env?.ESTIMATED_OS_DATA_GB)
            ? parseFloat(process.env.ESTIMATED_OS_DATA_GB)
            : 0.5;

        const programsInstalled = (typeof process !== 'undefined' && process.env?.PROGRAMS_INSTALLED)
            ? parseInt(process.env.PROGRAMS_INSTALLED, 10)
            : 10;

        const averageProgramSizeGb = (typeof process !== 'undefined' && process.env?.AVERAGE_PROGRAM_SIZE_GB)
            ? parseFloat(process.env.AVERAGE_PROGRAM_SIZE_GB)
            : 0.05;

        const estimatedUserDataSizeGb = (typeof process !== 'undefined' && process.env?.ESTIMATED_USER_DATA_SIZE_GB)
            ? parseFloat(process.env.ESTIMATED_USER_DATA_SIZE_GB)
            : 0.1;

        const totalMemBelowSafeLimitsGb = (typeof process !== 'undefined' && process.env?.TOTAL_MEM_BELOW_SAFE_LIMITS_GB)
            ? parseFloat(process.env.TOTAL_MEM_BELOW_SAFE_LIMITS_GB)
            : 0.2;

        const totalRamGb = (navigator as any)?.deviceMemory || 4; // fallback to 4GB if unsupported

        const safeConditionsThreshold = safeOsLimitGb + estimatedOsDataGb + (programsInstalled * averageProgramSizeGb) + estimatedUserDataSizeGb - totalMemBelowSafeLimitsGb;

        if (totalRamGb < safeConditionsThreshold) {
            isConstrained = true;
            evidence.push({
                message: `Constrained memory constraint triggered: device memory ${totalRamGb}GB is below safe threshold ${safeConditionsThreshold}GB`,
                details: {
                    deviceMemoryGb: totalRamGb,
                    safeConditionsThresholdGb: safeConditionsThreshold,
                    safeOsLimitGb,
                    estimatedOsDataGb,
                    programsInstalled,
                    averageProgramSizeGb,
                    estimatedUserDataSizeGb,
                    totalMemBelowSafeLimitsGb,
                    clientInstanceMetadata: {
                        platform: Platform.OS,
                        version: Platform.Version,
                        sessionStartTime: this.sessionStartTime,
                        visitedScreensCount: this.visitedScreens.length,
                        currentScreen: this.currentScreen,
                    }
                }
            });
        }

        // --- 2. Constrained Storage Evaluator ---
        // Formula: safe os operating conditions + estimated os operational data + program installed * average_size(configurable) + estimated user data size(configurable) - total available storage, below safe limits?
        const safeOsStorageLimitGb = (typeof process !== 'undefined' && process.env?.SAFE_OS_STORAGE_LIMIT_GB)
            ? parseFloat(process.env.SAFE_OS_STORAGE_LIMIT_GB)
            : 2.0;

        const estimatedOsStorageDataGb = (typeof process !== 'undefined' && process.env?.ESTIMATED_OS_STORAGE_DATA_GB)
            ? parseFloat(process.env.ESTIMATED_OS_STORAGE_DATA_GB)
            : 1.0;

        const storageProgramsInstalled = (typeof process !== 'undefined' && process.env?.STORAGE_PROGRAMS_INSTALLED)
            ? parseInt(process.env.STORAGE_PROGRAMS_INSTALLED, 10)
            : 20;

        const averageStorageProgramSizeGb = (typeof process !== 'undefined' && process.env?.AVERAGE_STORAGE_PROGRAM_SIZE_GB)
            ? parseFloat(process.env.AVERAGE_STORAGE_PROGRAM_SIZE_GB)
            : 0.1;

        const estimatedStorageUserDataSizeGb = (typeof process !== 'undefined' && process.env?.ESTIMATED_STORAGE_USER_DATA_SIZE_GB)
            ? parseFloat(process.env.ESTIMATED_STORAGE_USER_DATA_SIZE_GB)
            : 0.5;

        const totalAvailableStorageGb = (typeof process !== 'undefined' && process.env?.TOTAL_AVAILABLE_STORAGE_GB)
            ? parseFloat(process.env.TOTAL_AVAILABLE_STORAGE_GB)
            : 5.0; // Default/Mock available storage in GB

        const storageSafeConditionsThreshold = safeOsStorageLimitGb + estimatedOsStorageDataGb + (storageProgramsInstalled * averageStorageProgramSizeGb) + estimatedStorageUserDataSizeGb;

        if (totalAvailableStorageGb < storageSafeConditionsThreshold) {
            isConstrained = true;
            evidence.push({
                message: `Constrained storage constraint triggered: available storage ${totalAvailableStorageGb}GB is below safe threshold ${storageSafeConditionsThreshold}GB`,
                details: {
                    totalAvailableStorageGb,
                    storageSafeConditionsThresholdGb: storageSafeConditionsThreshold,
                    safeOsStorageLimitGb,
                    estimatedOsStorageDataGb,
                    storageProgramsInstalled,
                    averageStorageProgramSizeGb,
                    estimatedStorageUserDataSizeGb,
                    clientInstanceMetadata: {
                        platform: Platform.OS,
                        version: Platform.Version,
                        sessionStartTime: this.sessionStartTime,
                        visitedScreensCount: this.visitedScreens.length,
                        currentScreen: this.currentScreen,
                    }
                }
            });
        }

        if (isConstrained) {
            const anomaly = new Anomaly({
                type: AnomalyType.RESOURCE_DEFICIENCY,
                severity: AnomalySeverity.HIGH,
                evidence
            });
            await this.saveAnomaly(anomaly);
        }
    }
}

export const analyticsService = new AnalyticsService();
