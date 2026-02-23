"use client";

import React from 'react';
import AnomaliesChart from './AnomaliesChart';

interface KpiDashboardProps {
  data: {
    summary: {
      userVolume: number;
      userVolumeChange: number;
      systemCrashes: number;
      availability: number;
      performance: number;
      hydrationLatency: number;
      mttr: number;
      securityAnomalies: number;
      averageUserPerformance: number;
    };
    rawMetrics: any[];
  };
}

const KpiDashboard: React.FC<KpiDashboardProps> = ({ data }) => {
  const { summary, rawMetrics } = data;

  const kpis = [
    { label: 'User Volume', value: summary.userVolume, subValue: `+${summary.userVolumeChange} last 30d`, color: 'text-blue-600' },
    { label: 'System Crashes', value: summary.systemCrashes, subValue: 'Last 7 days', color: 'text-red-600' },
    { label: 'Availability', value: `${summary.availability}%`, subValue: 'Uptime', color: 'text-green-600' },
    { label: 'Avg Performance', value: `${summary.performance.toFixed(2)}ms`, subValue: 'Startup Time', color: 'text-purple-600' },
    { label: 'Hydration Latency', value: `${summary.hydrationLatency.toFixed(2)}ms`, subValue: 'Client Load', color: 'text-pink-600' },
    { label: 'MTTR', value: `${summary.mttr}m`, subValue: 'Mean Time to Recovery', color: 'text-orange-600' },
    { label: 'Security Anomalies', value: summary.securityAnomalies, subValue: 'Requires attention', color: 'text-yellow-600' },
    { label: 'Avg User XP', value: Math.round(summary.averageUserPerformance), subValue: 'Engagement level', color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</p>
            <p className={`mt-2 text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-1 text-xs text-gray-400">{kpi.subValue}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-700">Security Anomalies & Breaches</h3>
          <AnomaliesChart metrics={rawMetrics} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-700">Recent Raw Events</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {rawMetrics.slice(-5).map((m) => (
              <div key={m.id} className="p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                <span className="font-mono font-bold text-gray-600">{m.type}</span>
                <span className="ml-2 text-gray-400">{new Date(m.createdAt).toLocaleString()}</span>
                <div className="mt-1 text-gray-500 truncate">{m.payload}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiDashboard;
