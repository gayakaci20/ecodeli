'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface User {
  name: string | null;
  email: string;
}

interface Ride {
  id: string;
  startLocation: string;
  endLocation: string;
  departureTime: string;
  createdAt: string;
  user: User;
}

export default function AvailableRidesContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/activity');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        
        const data = await response.json();
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
      {availableRides.length === 0 ? (
        <p className="text-gray-500 py-4">No available rides</p>
      ) : (
        availableRides.map((ride) => (
          <div key={ride.id} className="py-3">
            <p className="text-sm font-medium text-gray-900">
              {ride.startLocation} → {ride.endLocation}
            </p>
            <p className="text-sm text-gray-500">
              By {ride.user.name || ride.user.email}
            </p>
            <p className="text-xs text-gray-500">
              Departure: {format(new Date(ride.departureTime), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        ))
      )}
    </div>
  );
} 