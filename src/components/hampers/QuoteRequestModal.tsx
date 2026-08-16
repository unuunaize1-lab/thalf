'use client';

import React, { useState } from 'react';
import { Gift, X, CheckCircle2, AlertCircle, Calendar, Sparkles } from 'lucide-react';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id?: string;
    name?: string;
    hamperType?: string;
    startingPrice?: number;
  };
}

export default function QuoteRequestModal({ isOpen, onClose, product }: QuoteRequestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    hamperType: product?.hamperType || 'Wedding Hampers',
    quantity: 25,
    budget: '',
    occasion: 'Wedding Celebration',
    deliveryDate: '',
    preferences: '',
    personalization: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/hampers/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productId: product?.id,
          hamperType: product?.hamperType || formData.hamperType,
          quantity: Number(formData.quantity),
          budget: formData.budget ? Number(formData.budget) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit quotation request');
      }

      setSubmittedRef(data.quoteNumber || 'HMP-REQUEST');
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-cream border border-gold/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative text-dark">
        
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-2 text-dark/50 hover:text-dark transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {submittedRef ? (
          <div className="text-center py-8 space-y-4">
            <div className="h-16 w-16 bg-gold/20 text-gold border border-gold/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-gold" />
            </div>

            <h2 className="font-editorial text-2xl sm:text-3xl font-light text-dark">
              Quotation Request Received
            </h2>

            <p className="text-xs text-dark/70 max-w-md mx-auto leading-relaxed">
              Thank you! Your custom hamper request has been submitted to THALF. Our concierge team will review your requirements and provide a server-authoritative quotation.
            </p>

            <div className="bg-parchment/40 p-4 border border-parchment inline-block font-mono text-sm font-bold text-gold">
              Quote Reference: {submittedRef}
            </div>

            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-gold text-dark text-xs font-semibold uppercase tracking-ultra hover:bg-gold-light transition-all"
              >
                Close & Continue Exploring
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-parchment pb-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-ultra text-gold flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> Custom Atelier Service
              </span>
              <h2 className="font-editorial text-2xl font-light text-dark">
                {product?.name ? `Request Quote for ${product.name}` : 'Request a Custom Hamper Quotation'}
              </h2>
              {product?.startingPrice && Number(product.startingPrice) > 0 && (
                <p className="text-xs font-mono text-gold font-bold">
                  Starting from ₹{Number(product.startingPrice).toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 p-3 text-red-800 text-xs font-bold uppercase tracking-wider flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs font-semibold focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs font-mono font-bold focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="ananya@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Hamper Occasion / Classification *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hamperType}
                    onChange={(e) => setFormData({ ...formData, hamperType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Estimated Quantity (Hampers) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs font-mono font-bold focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Target Budget (₹) (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs font-mono focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Preferred Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs font-mono focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Chocolate Preferences & Flavours
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dark cacao truffles, cardamon ganache, sugar-free options..."
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Personalization & Branding Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Monogrammed ribbons, custom brand cards, gold wax seals..."
                  value={formData.personalization}
                  onChange={(e) => setFormData({ ...formData, personalization: e.target.value })}
                  className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3 border-t border-parchment">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-cream border border-parchment text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2.5 bg-gold text-dark text-xs font-semibold uppercase tracking-ultra hover:bg-gold-light transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting Request...' : 'Submit Quotation Request'}
                </button>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
}
