'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Ride {
  id: string;
  startLocation: string;
  endLocation: string;
  departureTime: string;
  estimatedArrivalTime: string | null;
  vehicleType: string | null;
  availableSeats: number | null;
  maxPackageWeight: number | null;
  maxPackageSize: string | null;
  pricePerKg: number | null;
  pricePerSeat: number | null;
  status: 'AVAILABLE' | 'FULL' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

export default function RidesContent() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/rides?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch rides');
      
      const data = await response.json();
      setRides(data.rides);
      setTotalPages(Math.ceil(data.total / 10));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchRides();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ride?')) return;

    try {
      const response = await fetch(`/api/rides/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete ride');
      fetchRides();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ride');
    }
  };

  const getStatusBadgeColor = (status: Ride['status']) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-800',
      FULL: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status];
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="FULL">Full</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : rides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">No rides found</td>
                </tr>
              ) : (
                rides.map((ride) => (
                  <tr key={ride.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ride.user.name || ride.user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{ride.startLocation}</div>
                      <div className="text-sm text-gray-500">{ride.endLocation}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {format(new Date(ride.departureTime), 'dd/MM/yyyy HH:mm')}
                      </div>
                      {ride.estimatedArrivalTime && (
                        <div className="text-sm text-gray-500">
                          Est. Arrival: {format(new Date(ride.estimatedArrivalTime), 'HH:mm')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ride.vehicleType || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {ride.availableSeats !== null ? `${ride.availableSeats} seats` : '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ride.maxPackageWeight !== null ? `${ride.maxPackageWeight}kg max` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {ride.pricePerSeat !== null ? `${ride.pricePerSeat}€/seat` : '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ride.pricePerKg !== null ? `${ride.pricePerKg}€/kg` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(ride.status)}`}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        onClick={() => window.location.href = `/rides/${ride.id}/edit`}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(ride.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded bg-white text-sm text-gray-700 disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 border border-gray-300 rounded bg-white text-sm text-gray-700 disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 