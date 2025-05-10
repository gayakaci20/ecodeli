import { Suspense } from 'react';
import PackagesContent from './PackagesContent';
import Loading from '../dashboard/loading';

export const metadata = {
  title: 'Packages Management - EcoDeli Admin',
  description: 'Manage packages of the eco-delivery platform',
};

export default function PackagesPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-black">Packages Management</h1>
        <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md">
          Add Package
        </button>
      </div>
      <Suspense fallback={<Loading />}>
        <PackagesContent />
      </Suspense>
    </div>
  );
} 