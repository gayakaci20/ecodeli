'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import EditUserModal from '@/components/EditUserModal';

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: 'SENDER' | 'CARRIER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  phoneNumber?: string | null;
  address?: string | null;
}

export default function UsersContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for editing
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State for deleting
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (verifiedFilter) params.append('verified', verifiedFilter);

      const response = await fetch(`/api/users?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleFilter = () => {
    fetchUsers();
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (updatedUserData: Partial<User>) => {
    if (!editingUser) return;
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user');
      }
      setIsEditModalOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('Save user error:', err);
      setError(err instanceof Error ? err.message : 'Could not save user');
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      const response = await fetch(`/api/users/${deletingUser.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      setIsDeleteConfirmOpen(false);
      setDeletingUser(null);
      await fetchUsers(); // Re-fetch to see changes
      // Optionally show a success notification
    } catch (err) {
      console.error('Delete user error:', err);
      setError(err instanceof Error ? err.message : 'Could not delete user');
      // Optionally show an error notification to the user
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setDeletingUser(null);
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
              placeholder="Search by name or email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-black mb-1">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Roles</option>
              <option value="SENDER">Sender</option>
              <option value="CARRIER">Carrier</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-black mb-1">
              Verified
            </label>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
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

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Verified
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="text-sm text-black">
                  <td className="px-6 py-4 whitespace-nowrap">{user.firstName || '-'} {user.lastName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isVerified ? '✅' : '❌'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleEditClick(user)}
                      className="mr-2 bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(user)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-black">
            Showing <span className="font-medium">{users.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm text-black disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded bg-white text-sm text-black disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal - Replace placeholder */}
      {editingUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveUser}
          user={editingUser} 
        />
      )}

      {/* Delete Confirmation Placeholder - keep as is for now */}
      {isDeleteConfirmOpen && deletingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-black">
              Are you sure you want to delete user: {deletingUser.firstName} {deletingUser.lastName} ({deletingUser.email})? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={handleCancelDelete} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 