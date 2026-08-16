'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, UserCheck, Plus, Check, X, Search } from 'lucide-react';

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CONCIERGE';
  isActive: boolean;
  createdAt: string;
}

const MOCK_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: 'adm-1',
    name: 'Executive Concierge',
    email: 'admin@thalfchocolates.com',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: '2025-06-01',
  },
  {
    id: 'adm-2',
    name: 'Catalog Manager',
    email: 'catalog@thalfchocolates.com',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2025-09-15',
  },
  {
    id: 'adm-3',
    name: 'Order Fulfillment Desk',
    email: 'fulfillment@thalfchocolates.com',
    role: 'CONCIERGE',
    isActive: true,
    createdAt: '2026-01-10',
  },
];

export default function AdminRolesPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>(MOCK_ADMIN_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' | 'CONCIERGE',
  });

  const handleAddAdminUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newUser: AdminUserRecord = {
      id: `adm-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAdminUsers(prev => [...prev, newUser]);
    setIsModalOpen(false);
  };

  const handleToggleActive = (id: string) => {
    setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Access Control</span>
          <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
            Roles & Permissions
          </h1>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', role: 'ADMIN' });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 bg-gold text-dark text-xs font-bold uppercase tracking-widest hover:bg-gold/90 transition-all shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Admin User
        </button>
      </div>

      {/* Permission Matrix Card */}
      <div className="bg-cream border border-parchment p-6 shadow-lux space-y-4">
        <div className="border-b border-parchment pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-dark flex items-center">
            <ShieldCheck className="h-4 w-4 mr-2 text-gold" /> Role Permissions Matrix
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold">
                <th className="py-3">Permission Scope</th>
                <th className="py-3 text-center">Super Admin</th>
                <th className="py-3 text-center">Admin</th>
                <th className="py-3 text-center">Support Concierge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/40 text-dark">
              <tr>
                <td className="py-3 font-semibold">Manage Product Catalog & Pricing</td>
                <td className="py-3 text-center text-green-700 font-bold">✓</td>
                <td className="py-3 text-center text-green-700 font-bold">✓</td>
                <td className="py-3 text-center text-red-400">✕</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Fulfill Orders & Update Tracking</td>
                <td className="py-3 text-center text-green-700 font-bold">✓</td>
                <td className="py-3 text-center text-green-700 font-bold">✓</td>
                <td className="py-3 text-center text-green-700 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Manage Coupons & Promotions</td>
                <td className="py-3 text-center text-green-700 font-bold">✓</td>
                <td className="py-3 text-center text-green-700 font-bold">✓</td>
                <td className="py-3 text-center text-red-400">✕</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Export Financial & Tax Reports</td>
                <td className="py-3 text-center text-green-700 font-bold">✓</td>
                <td className="py-3 text-center text-red-400">✕</td>
                <td className="py-3 text-center text-red-400">✕</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">System Settings & Role Assignments</td>
                <td className="py-3 text-center text-green-700 font-bold">✓</td>
                <td className="py-3 text-center text-red-400">✕</td>
                <td className="py-3 text-center text-red-400">✕</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin User Roster */}
      <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
        <div className="p-4 border-b border-parchment bg-parchment/20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-dark">Active Administrator Roster</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold tracking-wider">
                <th className="py-4 px-4">User Name</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Created Date</th>
                <th className="py-4 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/40">
              {adminUsers.map(u => (
                <tr key={u.id} className="hover:bg-parchment/20 transition-colors">
                  <td className="py-4 px-4 font-serif font-bold text-dark text-sm">{u.name}</td>
                  <td className="py-4 px-4 text-dark/80">{u.email}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      u.role === 'SUPER_ADMIN' ? 'bg-gold text-dark' :
                      u.role === 'ADMIN' ? 'bg-cacao text-cream' : 'bg-parchment text-dark'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-dark/60 font-mono text-[10px]">{u.createdAt}</td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleToggleActive(u.id)}
                      className={`px-2 py-1 text-[9px] font-bold uppercase ${
                        u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Revoked'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm">
          <div className="bg-cream border border-parchment w-full max-w-md p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-dark/40 hover:text-dark"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">RBAC Config</span>
              <h2 className="text-xl font-serif font-black uppercase text-dark">
                Add Admin User
              </h2>
            </div>

            <form onSubmit={handleAddAdminUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Assigned Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="CONCIERGE">CONCIERGE (Order & Support)</option>
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-parchment">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-parchment text-xs font-bold uppercase tracking-wider text-dark/70 hover:bg-parchment/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold text-dark text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
