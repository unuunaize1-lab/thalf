'use client';

import React, { useState } from 'react';
import { Plus, Ticket, ToggleLeft, ToggleRight, Trash2, Edit3, Search, X } from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';

interface CouponRecord {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minSpend: number;
  timesUsed: number;
  usageLimit?: number;
  isActive: boolean;
  expiresAt: string;
}

const MOCK_COUPONS: CouponRecord[] = [
  {
    id: 'coup-1',
    code: 'WELCOME10',
    type: 'PERCENTAGE',
    value: 10,
    minSpend: 1500,
    timesUsed: 142,
    usageLimit: 500,
    isActive: true,
    expiresAt: '2026-12-31',
  },
  {
    id: 'coup-2',
    code: 'FESTIVE500',
    type: 'FIXED_AMOUNT',
    value: 500,
    minSpend: 3500,
    timesUsed: 89,
    usageLimit: 200,
    isActive: true,
    expiresAt: '2026-10-15',
  },
  {
    id: 'coup-3',
    code: 'VIPEXCLUSIVE',
    type: 'PERCENTAGE',
    value: 15,
    minSpend: 5000,
    timesUsed: 34,
    isActive: true,
    expiresAt: '2027-01-01',
  },
  {
    id: 'coup-4',
    code: 'SUMMEROFFER',
    type: 'PERCENTAGE',
    value: 20,
    minSpend: 2000,
    timesUsed: 300,
    usageLimit: 300,
    isActive: false,
    expiresAt: '2026-07-31',
  },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>(MOCK_COUPONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    value: '15',
    minSpend: '2000',
    usageLimit: '100',
    expiresAt: '2026-12-31',
    isActive: true,
  });

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleActive = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value) return;

    const newCoupon: CouponRecord = {
      id: `coup-${Date.now()}`,
      code: formData.code.toUpperCase().trim(),
      type: formData.type,
      value: parseFloat(formData.value),
      minSpend: parseFloat(formData.minSpend) || 0,
      timesUsed: 0,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      isActive: formData.isActive,
      expiresAt: formData.expiresAt,
    };

    setCoupons(prev => [newCoupon, ...prev]);
    setIsModalOpen(false);
  };

  const handleDeleteCoupon = (id: string) => {
    setCouponToDelete(id);
  };

  const confirmDeleteCoupon = () => {
    if (couponToDelete) {
      setCoupons(prev => prev.filter(c => c.id !== couponToDelete));
      setCouponToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Promotional Engine</span>
          <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
            Coupons & Voucher Codes
          </h1>
        </div>
        <button
          onClick={() => {
            setFormData({
              code: 'LUXURY' + Math.floor(10 + Math.random() * 90),
              type: 'PERCENTAGE',
              value: '15',
              minSpend: '2500',
              usageLimit: '150',
              expiresAt: '2026-12-31',
              isActive: true,
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 bg-gold text-dark text-xs font-bold uppercase tracking-widest hover:bg-gold/90 transition-all shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Coupon Code
        </button>
      </div>

      {/* Search */}
      <div className="bg-cream border border-parchment p-4 shadow-lux flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/40" />
          <input
            type="text"
            placeholder="Search promo codes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold tracking-wider bg-parchment/30">
                <th className="py-4 px-4">Voucher Code</th>
                <th className="py-4 px-4">Discount Value</th>
                <th className="py-4 px-4">Min. Spend Requirement</th>
                <th className="py-4 px-4">Redemptions</th>
                <th className="py-4 px-4">Expiry Date</th>
                <th className="py-4 px-4">Active Toggle</th>
                <th className="py-4 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/40">
              {filteredCoupons.map(c => (
                <tr key={c.id} className="hover:bg-parchment/20 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-mono font-bold text-dark text-sm bg-parchment/40 px-2 py-1 border border-parchment">
                      {c.code}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-serif font-bold text-gold text-sm">
                    {c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                  </td>

                  <td className="py-4 px-4 font-semibold text-dark/70">
                    ₹{c.minSpend.toLocaleString()}
                  </td>

                  <td className="py-4 px-4 text-dark">
                    <span className="font-bold">{c.timesUsed}</span>
                    {c.usageLimit && <span className="text-dark/40 text-[10px]"> / {c.usageLimit} Max</span>}
                  </td>

                  <td className="py-4 px-4 text-dark/60 font-mono text-[10px]">{c.expiresAt}</td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleActive(c.id)}
                      className={`flex items-center space-x-1 px-2 py-1 text-[9px] font-bold uppercase ${
                        c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="h-4 w-4" />
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
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Promotions</span>
              <h2 className="text-xl font-serif font-black uppercase text-dark">
                Create Voucher Code
              </h2>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono uppercase focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Min Spend (₹)</label>
                  <input
                    type="number"
                    value={formData.minSpend}
                    onChange={e => setFormData({ ...formData, minSpend: e.target.value })}
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                />
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
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!couponToDelete}
        title="Delete Coupon"
        description="Are you sure you want to deactivate and delete this promotion code permanently?\nThis action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={confirmDeleteCoupon}
        onCancel={() => setCouponToDelete(null)}
      />
    </div>
  );
}
