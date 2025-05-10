import { Suspense } from 'react';
import RecentActivityContent from '../RecentActivityContent';
import Loading from '../loading';

export const metadata = {
  title: 'Recent Activity - EcoDeli Admin',
  description: 'View recent activity across the eco-delivery platform',
};

export default function RecentActivityPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Recent Activity</h1>
        <p className="text-gray-600">Track recent changes and updates across the platform</p>
      </div>
      
      <Suspense fallback={<Loading />}>
        <RecentActivityContent />
      </Suspense>
    </div>
  );
} 