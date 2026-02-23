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

  async getDevOpsMetrics(): Promise<AnalyticsData> {
    const metrics = await this.prisma.devOpsMetric.findMany();

    // Calculate aggregated metrics
    const userCount = await this.prisma.user.count();
    const lastMonthUsers = await this.prisma.engagement.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const crashes = metrics.filter(m => m.type === 'CRASH').length;

    // Calculate performance (average startup time)
    const startupMetrics = metrics.filter(m => m.type === 'APP_STARTUP_TIME');
    const avgStartupTime = startupMetrics.length > 0
      ? startupMetrics.reduce((acc, m) => acc + (JSON.parse(m.payload).timeToFirstPrintMs || 0), 0) / startupMetrics.length
      : 0;

    const hydrationMetrics = metrics.filter(m => m.type === 'HYDRATION_LATENCY');
    const avgHydrationLatency = hydrationMetrics.length > 0
      ? hydrationMetrics.reduce((acc, m) => acc + (JSON.parse(m.payload).durationMs || 0), 0) / hydrationMetrics.length
      : 0;

    // Security anomalies
    const securityTypes = ['AUTHENTICITY', 'SECURITY_BREACH', 'API_ABNORMALITY', 'GAMEPLAY_FRAUD'];
    const securityAnomalies = metrics.filter(m => securityTypes.includes(m.type)).length;

    // Calculate MTTR
    let totalRecoveryTime = 0;
    let recoveryCount = 0;
    const sortedMetrics = [...metrics].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const crashEvents = sortedMetrics.filter(m => m.type === 'CRASH');

    crashEvents.forEach(crash => {
      const nextEvent = sortedMetrics.find(m =>
        m.type !== 'CRASH' &&
        new Date(m.createdAt).getTime() > new Date(crash.createdAt).getTime()
      );
      if (nextEvent) {
        totalRecoveryTime += (new Date(nextEvent.createdAt).getTime() - new Date(crash.createdAt).getTime());
        recoveryCount++;
      }
    });
    const mttr = recoveryCount > 0 ? (totalRecoveryTime / recoveryCount) / (1000 * 60) : 0;

    // Calculate Availability
    const totalTimeRange = metrics.length > 1
      ? new Date(sortedMetrics[sortedMetrics.length - 1].createdAt).getTime() - new Date(sortedMetrics[0].createdAt).getTime()
      : 30 * 24 * 60 * 60 * 1000;
    const estimatedDowntime = crashes * 15 * 60 * 1000; // Assume 15 mins per crash
    const availability = Math.max(0, Math.min(100, (1 - (estimatedDowntime / totalTimeRange)) * 100));

    return {
      rawMetrics: metrics,
      summary: {
        userVolume: userCount,
        userVolumeChange: lastMonthUsers,
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