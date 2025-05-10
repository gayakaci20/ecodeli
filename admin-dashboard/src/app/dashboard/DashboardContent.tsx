'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface DashboardData {
  users: any[];
  packages: any[];
  rides: any[];
  matches: any[];
  payments: any[];
  messages: any[];
  notifications: any[];
}

function formatDate(date: string) {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
}

export default function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
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

  const renderTable = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vérifié</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name || `${user.firstName} ${user.lastName}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.phoneNumber || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.isVerified ? '✅' : '❌'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expéditeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrivée</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poids</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{pkg.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pkg.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pkg.pickupAddress}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pkg.deliveryAddress}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pkg.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pkg.weight ? `${pkg.weight}kg` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(pkg.createdAt)}</td>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conducteur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrivée</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date départ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Places</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.rides.map((ride) => (
                  <tr key={ride.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{ride.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ride.startLocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ride.endLocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(ride.departureTime)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ride.availableSeats}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ride.status}</td>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trajet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.matches.map((match) => (
                  <tr key={match.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{match.package.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{`${match.ride.startLocation} → ${match.ride.endLocation}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{match.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{match.price ? `€${match.price}` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(match.createdAt)}</td>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{payment.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{`€${payment.amount}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{payment.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{payment.paymentMethod || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(payment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'messages':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">De</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">À</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.messages.map((message) => (
                  <tr key={message.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{message.sender.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{message.receiver.name}</td>
                    <td className="px-6 py-4">{message.content}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{message.read ? '✅' : '❌'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(message.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'notifications':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{notification.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{notification.type}</td>
                    <td className="px-6 py-4">{notification.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(notification.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow">
        {renderTable()}
      </div>
    </div>
  );
} 