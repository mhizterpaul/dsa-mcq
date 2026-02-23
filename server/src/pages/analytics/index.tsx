import React from 'react';
import { GetServerSideProps } from 'next';
import KpiDashboard from './components/KpiDashboard';
import { AnalyticsService } from '../../controllers/analyticsController';
import { EngagementService } from '../../controllers/engagementController';
import { prisma } from '../../infra/prisma/client';

interface AnalyticsDashboardProps {
  data: any;
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  if (!data) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">System Analytics Dashboard</h1>
      <KpiDashboard data={data} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const analyticsService = new AnalyticsService(prisma);
  const engagementService = new EngagementService(prisma);

  const devopsMetrics = await analyticsService.getDevOpsMetrics();
  const averageUserPerformance = await engagementService.getAverageUserPerformance();

  return {
    props: {
      data: {
        ...devopsMetrics,
        summary: {
          ...devopsMetrics.summary,
          averageUserPerformance,
        }
      },
    },
  };
};
