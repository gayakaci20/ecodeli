'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  totalUsers: number;
  totalPackages: number;
  totalRides: number;
  totalMatches: number;
  pendingPackages: number;
  availableRides: number;
  completedDeliveries: number;
  totalRevenue: number;
}

export default function DashboardStatsContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Packages',
      value: stats.totalPackages,
      color: 'bg-green-500',
    },
    {
      title: 'Total Rides',
      value: stats.totalRides,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Matches',
      value: stats.totalMatches,
      color: 'bg-yellow-500',
    },
    {
      title: 'Pending Packages',
      value: stats.pendingPackages,
      color: 'bg-orange-500',
    },
    {
      title: 'Available Rides',
      value: stats.availableRides,
      color: 'bg-indigo-500',
    },
    {
      title: 'Completed Deliveries',
      value: stats.completedDeliveries,
      color: 'bg-teal-500',
    },
    {
      title: 'Total Revenue',
      value: `€${stats.totalRevenue.toFixed(2)}`,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <div
          key={stat.title}
          className={`${stat.color} rounded-lg shadow-lg p-6 text-white`}
        >
          <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
          <p className="text-3xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
} 