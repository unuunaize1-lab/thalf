'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trash2, Search, RefreshCw } from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';

interface ReviewItem {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/admin/reviews');
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        if (res.status === 401) {
          window.location.href = '/secret-admin?redirect=/admin/reviews';
          return;
        }
        throw new Error(`Server returned error (${res.status})`);
      }
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setError(data.error || 'Failed to fetch reviews.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(r =>
    (r.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      const res = await fetch(`/api/v1/admin/reviews/${reviewToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(prev => prev.filter(r => r.id !== reviewToDelete));
      } else {
        setError(data.error || 'Failed to delete review');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
    } finally {
      setReviewToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Customer Voice</span>
          <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
            Review Moderation Desk
          </h1>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="p-2 border border-parchment text-dark hover:border-gold hover:text-gold transition-colors flex items-center space-x-2 text-xs uppercase font-bold"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold text-red-900">X</button>
        </div>
      )}

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
        <span className="text-[10px] font-bold uppercase text-dark/60">{filteredReviews.length} Reviews Found</span>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-dark/60 bg-cream border border-parchment">
          Loading Customer Reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-dark/60 bg-cream border border-parchment">
          No customer reviews recorded in database yet.
        </div>
      ) : (
        <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold tracking-wider bg-parchment/30">
                  <th className="py-4 px-4">Product Creation</th>
                  <th className="py-4 px-4">Reviewer</th>
                  <th className="py-4 px-4">Rating</th>
                  <th className="py-4 px-4">Feedback Comment</th>
                  <th className="py-4 px-4 text-right">Actions</th>
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

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setReviewToDelete(r.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Delete Review"
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
      )}

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
