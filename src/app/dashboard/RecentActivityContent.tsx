'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface User {
  name: string | null;
  email: string;
}

interface Package {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  user: User;
}

interface Ride {
  id: string;
  startLocation: string;
  endLocation: string;
  departureTime: string;
  createdAt: string;
  user: User;
}

interface Match {
  id: string;
  createdAt: string;
  package: {
    title: string;
  };
  ride: {
    startLocation: string;
    endLocation: string;
    user: User;
  };
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  user: User;
  match: {
    package: {
      title: string;
    };
  };
}

interface ActivityItem {
  type: 'package' | 'ride' | 'match' | 'payment';
  data: Package | Ride | Match | Payment;
  createdAt: string;
}

export default function RecentActivityContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [pendingPackages, setPendingPackages] = useState<Package[]>([]);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/activity');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        
        const data = await response.json();
        setRecentActivity(data.recentActivity);
        setPendingPackages(data.pendingPackages);
        setAvailableRides(data.availableRides);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderActivityItem = (item: ActivityItem) => {
    const formatUser = (user: User) => user.name || user.email;
    const timeAgo = format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm');

    switch (item.type) {
      case 'package': {
        const pkg = item.data as Package;
        return (
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                New package: {pkg.title}
              </p>
              <p className="text-sm text-gray-500">
                Created by {formatUser(pkg.user)}
              </p>
            </div>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>
        );
      }
      case 'ride': {
        const ride = item.data as Ride;
        return (
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                New ride: {ride.startLocation} → {ride.endLocation}
              </p>
              <p className="text-sm text-gray-500">
                Posted by {formatUser(ride.user)}
              </p>
            </div>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>
        );
      }
      case 'match': {
        const match = item.data as Match;
        return (
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                New match: {match.package.title}
              </p>
              <p className="text-sm text-gray-500">
                With {formatUser(match.ride.user)}'s ride
              </p>
            </div>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>
        );
      }
      case 'payment': {
        const payment = item.data as Payment;
        return (
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Payment {payment.status.toLowerCase()}: {payment.amount} {payment.currency}
              </p>
              <p className="text-sm text-gray-500">
                For package: {payment.match.package.title}
              </p>
            </div>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>
        );
      }
    }
  };

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

  return (
    <div className="divide-y divide-gray-200">
      {recentActivity.length === 0 ? (
        <p className="text-gray-500 py-4">No recent activity</p>
      ) : (
        recentActivity.map((item) => (
          <div key={`${item.type}-${item.data.id}`}>
            {renderActivityItem(item)}
          </div>
        ))
      )}
    </div>
  );
} 