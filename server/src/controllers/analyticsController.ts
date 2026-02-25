import { PrismaClient } from '@prisma/client';

export interface AnalyticsSummary {
  userVolume: number;
  userVolumeChange: number;
  systemCrashes: number;
  availability: number;
  performance: number;
  hydrationLatency: number;
  mttr: number;
  securityAnomalies: number;
}

export interface AnalyticsData {
  rawMetrics: any[];
  summary: AnalyticsSummary;
}

export class AnalyticsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getDevOpsMetrics(referenceDate: Date = new Date()): Promise<AnalyticsData> {
    const metrics = await this.prisma.devOpsMetric.findMany();
    const sortedMetrics = [...metrics].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const safeParse = (payload: string) => {
      try {
        return JSON.parse(payload);
      } catch (e) {
        return {};
      }
    };

    // Calculate aggregated metrics
    const userCount = await this.prisma.user.count();

    // Trend Calculation: Current 30d vs Previous 30d
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const currentPeriodStart = new Date(referenceDate.getTime() - thirtyDaysMs);
    const previousPeriodStart = new Date(referenceDate.getTime() - 2 * thirtyDaysMs);

    const currentPeriodUsers = await this.prisma.user.count({
      where: { createdAt: { gte: currentPeriodStart, lte: referenceDate } }
    });
    const previousPeriodUsers = await this.prisma.user.count({
      where: { createdAt: { gte: previousPeriodStart, lt: currentPeriodStart } }
    });

    const userVolumeChange = currentPeriodUsers - previousPeriodUsers;

    const crashes = metrics.filter(m => m.type === 'CRASH').length;

    // Calculate performance (average startup time)
    const startupMetrics = metrics.filter(m => m.type === 'APP_STARTUP_TIME');
    const validStartupTimes = startupMetrics
      .map(m => safeParse(m.payload).timeToFirstPrintMs)
      .filter(t => typeof t === 'number');

    const avgStartupTime = validStartupTimes.length > 0
      ? validStartupTimes.reduce((acc, t) => acc + t, 0) / validStartupTimes.length
      : 0;

    const hydrationMetrics = metrics.filter(m => m.type === 'HYDRATION_LATENCY');
    const validHydrationDurations = hydrationMetrics
      .map(m => safeParse(m.payload).durationMs)
      .filter(d => typeof d === 'number');

    const avgHydrationLatency = validHydrationDurations.length > 0
      ? validHydrationDurations.reduce((acc, d) => acc + d, 0) / validHydrationDurations.length
      : 0;

    // Security anomalies
    const securityTypes = ['AUTHENTICITY', 'SECURITY_BREACH', 'API_ABNORMALITY', 'GAMEPLAY_FRAUD'];
    const securityAnomalies = metrics.filter(m => securityTypes.includes(m.type)).length;

    // Calculate MTTR: Recovery is defined by the first successful APP_STARTUP_TIME after a CRASH
    let totalRecoveryTime = 0;
    let recoveryCount = 0;
    const crashEvents = sortedMetrics.filter(m => m.type === 'CRASH');

    crashEvents.forEach(crash => {
      const recoveryEvent = sortedMetrics.find(m =>
        m.type === 'APP_STARTUP_TIME' &&
        new Date(m.createdAt).getTime() > new Date(crash.createdAt).getTime()
      );
      if (recoveryEvent) {
        totalRecoveryTime += (new Date(recoveryEvent.createdAt).getTime() - new Date(crash.createdAt).getTime());
        recoveryCount++;
      }
    });
    const mttr = recoveryCount > 0 ? (totalRecoveryTime / recoveryCount) / (1000 * 60) : 0;

    // Calculate Availability
    const totalTimeRange = metrics.length > 1
      ? new Date(sortedMetrics[sortedMetrics.length - 1].createdAt).getTime() - new Date(sortedMetrics[0].createdAt).getTime()
      : thirtyDaysMs;
    const estimatedDowntime = crashes * 15 * 60 * 1000; // Assume 15 mins per crash if no recovery found
    const availability = Math.max(0, Math.min(100, (1 - (estimatedDowntime / totalTimeRange)) * 100));

    return {
      rawMetrics: metrics,
      summary: {
        userVolume: userCount,
        userVolumeChange,
        systemCrashes: crashes,
        availability: parseFloat(availability.toFixed(2)),
        performance: parseFloat(avgStartupTime.toFixed(2)),
        hydrationLatency: parseFloat(avgHydrationLatency.toFixed(2)),
        mttr: parseFloat(mttr.toFixed(2)),
        securityAnomalies,
      }
    };
  }
}