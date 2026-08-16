'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare, Search, Filter } from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';

interface ReviewItem {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    productName: 'Signature Dark Collection',
    customerName: 'Sara Al-Rashidi',
    rating: 5,
    comment: 'Exquisite aroma and velvet texture! The cardamom note is wonderfully balanced.',
    isVerified: true,
    status: 'APPROVED',
    createdAt: '2026-08-01',
  },
  {
    id: 'rev-2',
    productName: 'Artisan Truffles Selection',
    customerName: 'Aarav Patel',
    rating: 5,
    comment: 'Purchased this for a special celebration. The packaging and gold foil details are top tier luxury.',
    isVerified: true,
    status: 'APPROVED',
    createdAt: '2026-07-29',
  },
  {
    id: 'rev-3',
    productName: 'Obsidian 85% Dark Bar',
    customerName: 'Karan Sharma',
    rating: 4,
    comment: 'Very rich dark cocoa. A bit intense if you prefer milk chocolate, but fantastic with espresso.',
    isVerified: false,
    status: 'PENDING',
    createdAt: '2026-08-02',
  },
  {
    id: 'rev-4',
    productName: 'Spiced Pistachio Chocolate Slab',
    customerName: 'Meera Deshmukh',
    rating: 2,
    comment: 'Delivery box arrived slightly dented during transit although chocolate was intact.',
    isVerified: true,
    status: 'PENDING',
    createdAt: '2026-08-03',
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(MOCK_REVIEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: ReviewItem['status']) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleDelete = (id: string) => {
    setReviewToDelete(id);
  };

  const confirmDeleteReview = () => {
    if (reviewToDelete) {
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete));
      setReviewToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Customer Voice</span>
        <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
          Review Moderation Desk
        </h1>
      </div>

      {/* Filter & Search */}
      <div className="bg-cream border border-parchment p-4 shadow-lux flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/40" />
          <input
            type="text"
            placeholder="Search reviews by product, customer, or comment text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="py-2 px-3 bg-cream border border-parchment text-xs font-semibold uppercase tracking-wider text-dark focus:outline-none focus:border-gold"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Moderation</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Reviews Table */}
      <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold tracking-wider bg-parchment/30">
                <th className="py-4 px-4">Product Creation</th>
                <th className="py-4 px-4">Reviewer</th>
                <th className="py-4 px-4">Rating</th>
                <th className="py-4 px-4">Feedback Comment</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/40">
              {filteredReviews.map(r => (
                <tr key={r.id} className="hover:bg-parchment/20 transition-colors">
                  <td className="py-4 px-4 font-serif font-bold text-dark text-sm">
                    {r.productName}
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-semibold text-dark">{r.customerName}</p>
                    {r.isVerified && (
                      <span className="text-[9px] font-bold text-green-700 block">✓ Verified Buyer</span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center text-gold space-x-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-gold' : 'text-dark/20'}`} />
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-dark/80 max-w-xs">
                    <p className="italic font-serif">&ldquo;{r.comment}&rdquo;</p>
                    <span className="text-[9px] text-dark/40 font-mono block mt-1">{r.createdAt}</span>
                  </td>

                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      r.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      r.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {r.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                          className="px-2 py-1 bg-green-700 text-white text-[9px] font-bold uppercase tracking-wider hover:bg-green-800 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                          className="px-2 py-1 bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider hover:bg-amber-700 transition-colors"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!reviewToDelete}
        title="Delete Product Review"
        description="Are you sure you want to delete this product review? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={confirmDeleteReview}
        onCancel={() => setReviewToDelete(null)}
      />
    </div>
  );
}
