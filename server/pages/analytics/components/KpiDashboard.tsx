"use client";

import React from 'react';

interface KpiDashboardProps {
  metrics: any[];
}

const KpiDashboard: React.FC<KpiDashboardProps> = ({ metrics }) => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">KPI Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="p-4 border rounded-lg">
            <h3 className="font-bold">{metric.type}</h3>
            <pre className="mt-2 bg-gray-100 p-2 rounded">
              {JSON.stringify(JSON.parse(metric.payload), null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KpiDashboard;
