'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Package {
  id: string;
  title: string;
  description: string | null;
  weight: number | null;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'PENDING' | 'MATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

export default function PackagesContent() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/packages?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch packages');
      
      const data = await response.json();
      setPackages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleFilter = () => {
    fetchPackages();
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-black mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-black mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="MATCHED">Matched</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Sender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Pickup</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Delivery</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Weight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : packages.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">No packages found</td>
              </tr>
            ) : (
              packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-black">{pkg.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">{pkg.user.name || pkg.user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">{pkg.pickupAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">{pkg.deliveryAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">{pkg.weight ? `${pkg.weight}kg` : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">{pkg.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {format(new Date(pkg.createdAt), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-sky-500 hover:text-sky-800 mr-2">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{packages.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm text-gray-700 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm text-gray-700 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 