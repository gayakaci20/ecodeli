import { Suspense } from 'react';
import Loading from './loading';
import DashboardDataContent from './DashboardDataContent';
import DashboardStatsContent from './DashboardStatsContent';

export const metadata = {
  title: 'Dashboard - EcoDeli Admin',
  description: 'Admin dashboard for the eco-delivery platform',
};

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      <Suspense fallback={<Loading />}>
        <DashboardStatsContent />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <DashboardDataContent />
      </Suspense>
    </div>
  );
} 