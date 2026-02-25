"use client";

import React from 'react';

interface AnomaliesChartProps {
  metrics: any[];
}

const AnomaliesChart: React.FC<AnomaliesChartProps> = ({ metrics }) => {
  const securityTypes = ['AUTHENTICITY', 'SECURITY_BREACH', 'API_ABNORMALITY', 'GAMEPLAY_FRAUD'];

  const counts = securityTypes.map(type => ({
    type,
    count: metrics.filter(m => m.type === type).length
  }));

  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="space-y-4">
      {counts.map((item) => (
        <div key={item.type}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-600">{item.type.replace('_', ' ')}</span>
            <span className="text-gray-500">{item.count}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
      {metrics.filter(m => securityTypes.includes(m.type)).length === 0 && (
        <p className="text-center text-gray-400 py-8 italic">No anomalies detected</p>
      )}
    </div>
  );
};

export default AnomaliesChart;
