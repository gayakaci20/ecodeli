import { Suspense } from 'react';
import UsersContent from './UsersContent';
import Loading from '../dashboard/loading';

export const metadata = {
  title: 'Users Management - EcoDeli Admin',
  description: 'Manage users of the eco-delivery platform',
};

export default function UsersPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-black">Users Management</h1>
        <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md">
          Add User
        </button>
      </div>
      <Suspense fallback={<Loading />}>
        <UsersContent />
      </Suspense>
    </div>
  );
} 