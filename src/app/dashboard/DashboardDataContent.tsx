'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  address: string | null;
  role: string;
  isVerified: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  image: string | null;
}

interface Package {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface Ride {
  id: string;
  startLocation: string;
  endLocation: string;
  departureTime: Date;
  status: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface Match {
  id: string;
  status: string;
  createdAt: Date;
  package: {
    title: string;
    user: {
      name: string | null;
      email: string;
    };
  };
  ride: {
    startLocation: string;
    endLocation: string;
    user: {
      name: string | null;
      email: string;
    };
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  match: {
    package: {
      title: string;
    };
  };
}

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  sender: {
    name: string | null;
    email: string;
  };
  receiver: {
    name: string | null;
    email: string;
  };
}

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface DashboardData {
  users: User[];
  packages: Package[];
  rides: Ride[];
  matches: Match[];
  payments: Payment[];
  messages: Message[];
  notifications: Notification[];
}

export default function DashboardDataContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/data');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  const tabs = [
    { id: 'users', label: 'Utilisateurs' },
    { id: 'packages', label: 'Colis' },
    { id: 'rides', label: 'Trajets' },
    { id: 'matches', label: 'Correspondances' },
    { id: 'payments', label: 'Paiements' },
    { id: 'messages', label: 'Messages' },
    { id: 'notifications', label: 'Notifications' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.users.map((user) => {
                  console.log('User data:', {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    name: user.name,
                    email: user.email
                  });
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(user.firstName || user.lastName) 
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : user.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isVerified ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Vérifié
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Non vérifié
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case 'packages':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expéditeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{pkg.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pkg.user.name || pkg.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(pkg.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'rides':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trajet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conducteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Départ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.rides.map((ride) => (
                  <tr key={ride.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {ride.startLocation}
                      </div>
                      <div className="text-sm text-gray-500">
                        → {ride.endLocation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ride.user.name || ride.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(ride.departureTime), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {ride.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'matches':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trajet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.matches.map((match) => (
                  <tr key={match.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {match.package.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        par {match.package.user.name || match.package.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {match.ride.startLocation} → {match.ride.endLocation}
                      </div>
                      <div className="text-sm text-gray-500">
                        par {match.ride.user.name || match.ride.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {match.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(match.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'payments':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.amount.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.user.name || payment.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.match.package.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-4">
            {data.messages.map((message) => (
              <div
                key={message.id}
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      De: {message.sender.name || message.sender.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      À: {message.receiver.name || message.receiver.email}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <p className="text-sm text-gray-600">{message.content}</p>
              </div>
            ))}
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Pour: {notification.user.name || notification.user.email}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        notification.type === 'INFO'
                          ? 'bg-blue-100 text-blue-800'
                          : notification.type === 'SUCCESS'
                          ? 'bg-green-100 text-green-800'
                          : notification.type === 'WARNING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {notification.type}
                    </span>
                    <p className="text-xs text-gray-500 ml-2">
                      {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{notification.content}</p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">{renderContent()}</div>
    </div>
  );
} 