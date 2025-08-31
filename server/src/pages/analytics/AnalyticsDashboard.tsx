import React from 'react';
import KpiDashboard from './components/KpiDashboard';

async function getMetrics() {
  // This fetch call will be executed on the server
  const res = await fetch('http://localhost:3000/api/analytics/devops', { cache: 'no-store' });
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default async function AnalyticsDashboard() {
  const metrics = await getMetrics();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      <KpiDashboard metrics={metrics} />
    </div>
  );
}
