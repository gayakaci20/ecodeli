'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Match {
  id: string;
  status: 'PROPOSED' | 'ACCEPTED_BY_SENDER' | 'ACCEPTED_BY_CARRIER' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  price: number | null;
  createdAt: string;
  package: {
    id: string;
    title: string;
    user: {
      name: string | null;
      email: string;
    };
  };
  ride: {
    id: string;
    startLocation: string;
    endLocation: string;
    departureTime: string;
    user: {
      name: string | null;
      email: string;
    };
  };
}

export default function MatchesContent() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/matches?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      
      const data = await response.json();
      setMatches(data.matches);
      setTotalPages(Math.ceil(data.total / 10));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchMatches();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;

    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete match');
      fetchMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete match');
    }
  };

  const getStatusBadgeColor = (status: Match['status']) => {
    const colors = {
      PROPOSED: 'bg-yellow-100 text-yellow-800',
      ACCEPTED_BY_SENDER: 'bg-blue-100 text-blue-800',
      ACCEPTED_BY_CARRIER: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const formatStatus = (status: Match['status']) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
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
              placeholder="Search by package or user"
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
              <option value="PROPOSED">Proposed</option>
              <option value="ACCEPTED_BY_SENDER">Accepted by Sender</option>
              <option value="ACCEPTED_BY_CARRIER">Accepted by Carrier</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REJECTED">Rejected</option>
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

      {/* Matches Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ride</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">No matches found</td>
                </tr>
              ) : (
                matches.map((match) => (
                  <tr key={match.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{match.package.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {match.package.user.name || match.package.user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{match.ride.startLocation}</div>
                      <div className="text-sm text-gray-500">{match.ride.endLocation}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(match.ride.departureTime), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {match.ride.user.name || match.ride.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {match.price ? `${match.price}€` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(match.status)}`}>
                        {formatStatus(match.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(match.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        onClick={() => window.location.href = `/matches/${match.id}/edit`}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(match.id)}
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