'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Key, RefreshCw, Eye, EyeOff, X, UserCheck, AlertCircle } from 'lucide-react';

interface AdminUserRecord {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  role: {
    id: string;
    name: 'SUPER_ADMIN' | 'ADMIN' | 'CONCIERGE' | 'CUSTOMER';
  };
}

export default function AdminRolesPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleType: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' | 'CONCIERGE',
  });
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Edit Credential Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    newPassword: '',
    roleType: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' | 'CONCIERGE',
  });
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Fetch real admin users from backend API
  const fetchAdminUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/users');
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch admin roster.');
      }

      setAdminUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred loading administrators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // Handle Creating New Admin Credential
  const handleAddAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create admin user.');
      }

      setIsAddModalOpen(false);
      setAddForm({ name: '', email: '', phone: '', password: '', roleType: 'ADMIN' });
      fetchAdminUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create admin credentials.');
    } finally {
      setAddLoading(false);
    }
  };

  // Open Edit Modal with selected user details
  const openEditModal = (user: AdminUserRecord) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone ? user.phone.replace('+91', '') : '',
      newPassword: '',
      roleType: user.role.name as 'SUPER_ADMIN' | 'ADMIN' | 'CONCIERGE',
    });
    setIsEditModalOpen(true);
  };

  // Handle Changing Credentials (Update Password / Details)
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setEditLoading(true);
    try {
      const payload: any = {
        userId: selectedUser.id,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        roleType: editForm.roleType,
      };

      if (editForm.newPassword.trim()) {
        payload.password = editForm.newPassword;
      }

      const res = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update credentials.');
      }

      setIsEditModalOpen(false);
      fetchAdminUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update credentials.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Access & Security</span>
          <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
            Roles & Admin Credentials
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAdminUsers}
            className="px-3 py-3 border border-parchment text-dark/70 hover:bg-parchment/30 transition-colors"
            title="Refresh Roster"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setAddForm({ name: '', email: '', phone: '', password: '', roleType: 'ADMIN' });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-5 py-3 bg-gold text-dark text-xs font-bold uppercase tracking-widest hover:bg-gold/90 transition-all shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Admin Credentials
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-400 bg-red-50 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Permission Matrix Summary Card */}
      <div className="bg-cream border border-parchment p-6 shadow-lux space-y-4">
        <div className="border-b border-parchment pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-dark flex items-center">
            <ShieldCheck className="h-4 w-4 mr-2 text-gold" /> System Authorization Matrix
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold">
                <th className="py-2">Permission Scope</th>
                <th className="py-2 text-center">Super Admin</th>
                <th className="py-2 text-center">Admin</th>
                <th className="py-2 text-center">Support Concierge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/40 text-dark">
              <tr>
                <td className="py-2.5 font-semibold">Manage Credentials & User Roles</td>
                <td className="py-2.5 text-center text-green-700 font-bold">✓</td>
                <td className="py-2.5 text-center text-red-400">✕</td>
                <td className="py-2.5 text-center text-red-400">✕</td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold">Product & Price Catalog Management</td>
                <td className="py-2.5 text-center text-green-700 font-bold">✓</td>
                <td className="py-2.5 text-center text-green-700 font-bold">✓</td>
                <td className="py-2.5 text-center text-red-400">✕</td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold">Order Processing & Fulfillment</td>
                <td className="py-2.5 text-center text-green-700 font-bold">✓</td>
                <td className="py-2.5 text-center text-green-700 font-bold">✓</td>
                <td className="py-2.5 text-center text-green-700 font-bold">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin User Roster */}
      <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
        <div className="p-4 border-b border-parchment bg-parchment/20 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-dark flex items-center">
            <UserCheck className="h-4 w-4 mr-2 text-gold" /> Active Administrator Roster ({adminUsers.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-dark/50 font-mono">Fetching admin credentials...</div>
        ) : adminUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-dark/50">No administrative accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold tracking-wider">
                  <th className="py-4 px-4">Admin Name</th>
                  <th className="py-4 px-4">Mobile Number (Login ID)</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment/40">
                {adminUsers.map(u => (
                  <tr key={u.id} className="hover:bg-parchment/20 transition-colors">
                    <td className="py-4 px-4 font-serif font-bold text-dark text-sm">
                      {u.name || 'Unnamed Admin'}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-gold">
                      {u.phone || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-dark/80">{u.email || '—'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                        u.role.name === 'SUPER_ADMIN' ? 'bg-gold text-dark' :
                        u.role.name === 'ADMIN' ? 'bg-cacao text-cream' : 'bg-parchment text-dark'
                      }`}>
                        {u.role.name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => openEditModal(u)}
                        className="inline-flex items-center px-3 py-1.5 border border-parchment text-[10px] font-bold uppercase tracking-wider text-dark hover:bg-gold hover:border-gold transition-colors"
                      >
                        <Key className="w-3 h-3 mr-1.5" /> Edit Credentials
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Create New Admin Credentials */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm">
          <div className="bg-cream border border-parchment w-full max-w-md p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-dark/40 hover:text-dark"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">New Credential</span>
              <h2 className="text-xl font-serif font-black uppercase text-dark">
                Create Admin Credentials
              </h2>
            </div>

            <form onSubmit={handleAddAdminUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Admin Mobile Number (Login ID) *
                </label>
                <div className="flex items-center border border-parchment bg-cream focus-within:border-gold">
                  <span className="px-3 py-2 text-xs font-mono text-gold border-r border-parchment bg-parchment/10">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={addForm.phone}
                    onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-transparent text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="admin@thalf.store"
                  value={addForm.email}
                  onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Login Password *
                </label>
                <div className="relative border border-parchment bg-cream focus-within:border-gold flex items-center">
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={addForm.password}
                    onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-transparent text-xs focus:outline-none pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-2 text-dark/50 hover:text-dark p-1"
                  >
                    {showAddPassword ? <EyeOff className="w-4 h-4 text-gold" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Assigned Role
                </label>
                <select
                  value={addForm.roleType}
                  onChange={e => setAddForm({ ...addForm, roleType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                >
                  <option value="ADMIN">ADMIN (Catalog, Orders & Inventory)</option>
                  <option value="CONCIERGE">CONCIERGE (Orders & Support Only)</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN (Full Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-parchment">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-parchment text-xs font-bold uppercase tracking-wider text-dark/70 hover:bg-parchment/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 bg-gold text-dark text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors shadow-md disabled:opacity-50"
                >
                  {addLoading ? 'Creating...' : 'Save Admin Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Change / Update Credentials */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm">
          <div className="bg-cream border border-parchment w-full max-w-md p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-dark/40 hover:text-dark"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Update Security</span>
              <h2 className="text-xl font-serif font-black uppercase text-dark">
                Change Credentials
              </h2>
              <p className="text-xs text-dark/60 mt-0.5">Editing credentials for {selectedUser.name || selectedUser.phone}</p>
            </div>

            <form onSubmit={handleUpdateCredentials} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Mobile Number (Login ID)
                </label>
                <div className="flex items-center border border-parchment bg-cream focus-within:border-gold">
                  <span className="px-3 py-2 text-xs font-mono text-gold border-r border-parchment bg-parchment/10">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-transparent text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  New Password (Leave blank to keep existing)
                </label>
                <div className="relative border border-parchment bg-cream focus-within:border-gold flex items-center">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Enter new password to update"
                    value={editForm.newPassword}
                    onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-transparent text-xs focus:outline-none pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2 text-dark/50 hover:text-dark p-1"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4 text-gold" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Role Privilege
                </label>
                <select
                  value={editForm.roleType}
                  onChange={e => setEditForm({ ...editForm, roleType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="CONCIERGE">CONCIERGE</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-parchment">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-parchment text-xs font-bold uppercase tracking-wider text-dark/70 hover:bg-parchment/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-gold text-dark text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors shadow-md disabled:opacity-50"
                >
                  {editLoading ? 'Updating...' : 'Update Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
