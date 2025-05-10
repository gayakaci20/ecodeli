import { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import Loading from './loading';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing the eco-delivery platform',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <Suspense fallback={<Loading />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
} 