import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loading from './loading';

// Use dynamic import instead of direct import
const DashboardContent = dynamic(() => import('./DashboardContent'), {
  loading: () => <Loading />
});

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing the eco-delivery platform',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <DashboardContent />
    </div>
  );
} 