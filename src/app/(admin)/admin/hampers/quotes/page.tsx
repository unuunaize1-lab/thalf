'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Calculator, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';

const STATUS_OPTIONS = [
  { label: 'All Requests', value: 'ALL' },
  { label: 'New Enquiries', value: 'NEW' },
  { label: 'Reviewing', value: 'REVIEWING' },
  { label: 'Quoted Sent', value: 'QUOTED' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function AdminQuoteRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Quotation Drawer State
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Quote Action Form
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [quoteValidUntil, setQuoteValidUntil] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [status, setStatus] = useState<string>('QUOTED');

  const fetchQuoteRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/admin/hampers/quotes?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();

      if (data.success) {
        setRequests(data.requests || []);
        setAnalytics(data.analytics || null);
      } else {
        throw new Error(data.error || 'Failed to fetch quote requests');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuoteRequests();
  }, [statusFilter]);

  const handleOpenQuoteDrawer = (quote: any) => {
    setSelectedQuote(quote);
    setUnitPrice(Number(quote.quotedUnitPrice || quote.product?.startingPrice || quote.budget ? (Number(quote.budget) / (quote.quantity || 1)) : 1500));
    setQuantity(quote.quotedQuantity || quote.quantity || 1);
    setAdditionalCharges(Number(quote.additionalCharges || 0));
    setDiscountAmount(Number(quote.discountAmount || 0));
    setQuoteValidUntil(quote.quoteValidUntil ? new Date(quote.quoteValidUntil).toISOString().split('T')[0] : '');
    setAdminNotes(quote.adminNotes || '');
    setStatus(quote.status || 'QUOTED');
  };

  // Live Server-Authoritative Pricing Calculator Preview
  const liveBaseSubtotal = useMemo(() => {
    return Math.max(0, Number(unitPrice || 0)) * Math.max(1, Number(quantity || 1));
  }, [unitPrice, quantity]);

  const liveFinalQuoteAmount = useMemo(() => {
    return Math.max(0, liveBaseSubtotal + Number(additionalCharges || 0) - Number(discountAmount || 0));
  }, [liveBaseSubtotal, additionalCharges, discountAmount]);

  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/admin/hampers/quotes/${selectedQuote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotedUnitPrice: Number(unitPrice),
          quotedQuantity: Number(quantity),
          additionalCharges: Number(additionalCharges),
          discountAmount: Number(discountAmount),
          quoteValidUntil: quoteValidUntil ? new Date(quoteValidUntil) : undefined,
          adminNotes,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update quotation');
      }

      setSelectedQuote(null);
      fetchQuoteRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="border-b border-parchment pb-4">
        <h1 className="font-serif text-2xl font-black uppercase tracking-wider text-dark flex items-center">
          <ClipboardList className="h-6 w-6 mr-3 text-gold" /> Hamper Quotation Management Desk
        </h1>
        <p className="text-xs text-dark/70 font-sans mt-1">
          Review customer custom hamper enquiries, calculate server-authoritative quotations, and issue formal pricing.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 p-4 text-red-800 text-xs font-bold uppercase tracking-wider flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real Analytics Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-cream border border-parchment p-3.5 shadow-lux">
          <div className="text-[9px] font-bold uppercase tracking-wider text-dark/60">Total Enquiries</div>
          <div className="text-lg font-mono font-black text-dark mt-1">
            {analytics ? analytics.totalRequests : '—'}
          </div>
        </div>

        <div className="bg-cream border border-parchment p-3.5 shadow-lux">
          <div className="text-[9px] font-bold uppercase tracking-wider text-amber-700">New Enquiries</div>
          <div className="text-lg font-mono font-black text-amber-800 mt-1">
            {analytics ? analytics.newRequests : '—'}
          </div>
        </div>

        <div className="bg-cream border border-parchment p-3.5 shadow-lux">
          <div className="text-[9px] font-bold uppercase tracking-wider text-blue-700">Quotes Pending</div>
          <div className="text-lg font-mono font-black text-blue-800 mt-1">
            {analytics ? analytics.pendingQuotes : '—'}
          </div>
        </div>

        <div className="bg-cream border border-parchment p-3.5 shadow-lux">
          <div className="text-[9px] font-bold uppercase tracking-wider text-purple-700">Quotes Sent</div>
          <div className="text-lg font-mono font-black text-purple-800 mt-1">
            {analytics ? analytics.quotedRequests : '—'}
          </div>
        </div>

        <div className="bg-cream border border-parchment p-3.5 shadow-lux">
          <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Accepted Quotes</div>
          <div className="text-lg font-mono font-black text-emerald-800 mt-1">
            {analytics ? analytics.acceptedRequests : '—'}
          </div>
        </div>

        <div className="bg-cream border border-parchment p-3.5 shadow-lux">
          <div className="text-[9px] font-bold uppercase tracking-wider text-dark/60">Quoted Value</div>
          <div className="text-lg font-mono font-black text-dark mt-1">
            {analytics ? `₹${analytics.totalQuotedValue.toLocaleString('en-IN')}` : '—'}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex overflow-x-auto border-b border-parchment scrollbar-none">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
                statusFilter === opt.value
                  ? 'border-gold text-dark bg-parchment/30'
                  : 'border-transparent text-dark/60 hover:text-dark'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="bg-cream border border-parchment p-3 flex gap-3 shadow-lux">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark/40" />
            <input
              type="text"
              placeholder="Search quotes by reference #, customer name, phone, or occasion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQuoteRequests()}
              className="w-full pl-9 pr-4 py-2 bg-cream border border-parchment text-xs font-semibold focus:outline-none focus:border-gold"
            />
          </div>
          <button
            onClick={fetchQuoteRequests}
            className="px-4 py-2 bg-dark text-cream text-xs font-bold uppercase tracking-wider hover:bg-dark/90"
          >
            Search
          </button>
        </div>
      </div>

      {/* Quote Requests Table */}
      <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-dark/60">
            Loading Quotation Enquiries...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-dark/60">
            No quotation requests found matching filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-parchment bg-parchment/30 text-[10px] uppercase font-bold tracking-wider text-dark/70">
                  <th className="p-4">Ref #</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Hamper Type</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Occasion & Date</th>
                  <th className="p-4">Customer Budget</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Quoted Amount</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment">
                {requests.map((quote) => (
                  <tr key={quote.id} className="hover:bg-parchment/15 transition-colors">
                    <td className="p-4 font-mono font-bold text-gold">
                      {quote.quoteNumber}
                    </td>

                    <td className="p-4 font-semibold">
                      <div className="text-dark font-bold">{quote.name}</div>
                      <div className="text-[10px] text-dark/60 font-mono">{quote.phone}</div>
                    </td>

                    <td className="p-4">
                      <span className="inline-block px-2 py-1 bg-parchment/40 text-dark text-[10px] font-bold uppercase tracking-wider border border-parchment">
                        {quote.hamperType}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold text-dark">
                      {quote.quantity} units
                    </td>

                    <td className="p-4 text-[11px]">
                      <div className="font-semibold text-dark">{quote.occasion || 'General'}</div>
                      <div className="text-[10px] text-dark/50">
                        {quote.deliveryDate ? new Date(quote.deliveryDate).toLocaleDateString('en-IN') : 'Flexible'}
                      </div>
                    </td>

                    <td className="p-4 font-mono">
                      {quote.budget ? `₹${Number(quote.budget).toLocaleString('en-IN')}` : 'Flexible'}
                    </td>

                    <td className="p-4">
                      {quote.status === 'NEW' && (
                        <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold uppercase tracking-wider">
                          New Enquiry
                        </span>
                      )}
                      {quote.status === 'REVIEWING' && (
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-300 text-[9px] font-bold uppercase tracking-wider">
                          Reviewing
                        </span>
                      )}
                      {quote.status === 'QUOTED' && (
                        <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-300 text-[9px] font-bold uppercase tracking-wider">
                          Quote Sent
                        </span>
                      )}
                      {quote.status === 'ACCEPTED' && (
                        <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9px] font-bold uppercase tracking-wider">
                          Accepted
                        </span>
                      )}
                      {quote.status === 'REJECTED' && (
                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-900 border border-red-300 text-[9px] font-bold uppercase tracking-wider">
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono font-bold text-dark">
                      {quote.quotedAmount ? `₹${Number(quote.quotedAmount).toLocaleString('en-IN')}` : '—'}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenQuoteDrawer(quote)}
                        className="px-3 py-1.5 bg-gold text-dark text-[10px] font-bold uppercase tracking-wider hover:bg-gold/90 transition-all shadow-sm"
                      >
                        Action Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADMIN QUOTATION ACTION & PRICING PREVIEW DRAWER */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex justify-end bg-dark/70 backdrop-blur-sm">
          <div className="bg-cream border-l border-parchment w-full max-w-xl h-full overflow-y-auto shadow-2xl p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-parchment pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Quotation Desk</span>
                <h2 className="font-serif text-lg font-black uppercase text-dark">
                  Quote Reference: {selectedQuote.quoteNumber}
                </h2>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="text-dark/50 hover:text-dark">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Customer & Enquiry Brief */}
            <div className="bg-parchment/20 p-4 border border-parchment space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark flex items-center">
                <User className="h-4 w-4 mr-1.5 text-gold" /> Customer Enquiry Brief
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase text-dark/60 block">Customer Name</span>
                  <span className="font-bold text-dark">{selectedQuote.name}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-dark/60 block">Phone Number</span>
                  <span className="font-mono font-bold text-dark">{selectedQuote.phone}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-dark/60 block">Hamper Type</span>
                  <span className="font-semibold text-dark">{selectedQuote.hamperType}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-dark/60 block">Requested Quantity</span>
                  <span className="font-mono font-bold text-dark">{selectedQuote.quantity} Units</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-dark/60 block">Occasion</span>
                  <span className="font-semibold text-dark">{selectedQuote.occasion || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-dark/60 block">Target Budget</span>
                  <span className="font-mono font-bold text-dark">
                    {selectedQuote.budget ? `₹${Number(selectedQuote.budget).toLocaleString('en-IN')}` : 'Flexible'}
                  </span>
                </div>
              </div>

              {selectedQuote.preferences && (
                <div className="pt-2 border-t border-parchment">
                  <span className="text-[9px] font-bold uppercase text-dark/60 block">Chocolate Preferences</span>
                  <p className="text-xs text-dark/80 italic mt-0.5">{selectedQuote.preferences}</p>
                </div>
              )}

              {selectedQuote.personalization && (
                <div className="pt-1">
                  <span className="text-[9px] font-bold uppercase text-dark/60 block">Personalization Requirements</span>
                  <p className="text-xs text-dark/80 italic mt-0.5">{selectedQuote.personalization}</p>
                </div>
              )}
            </div>

            {/* Admin Interactive Quotation Form */}
            <form onSubmit={handleSaveQuotation} className="space-y-6">
              
              <div className="bg-amber-50/50 p-4 border border-amber-200 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center">
                  <Calculator className="h-4 w-4 mr-1.5 text-amber-700" /> Quotation Calculator
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">
                      Quoted Unit Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-cream border border-amber-300 text-xs font-mono font-bold focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">
                      Quoted Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-cream border border-amber-300 text-xs font-mono font-bold focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">
                      Additional Fees / Delivery (₹)
                    </label>
                    <input
                      type="number"
                      value={additionalCharges}
                      onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-cream border border-amber-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-dark/70 mb-1">
                      Volume Discount (₹)
                    </label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-cream border border-amber-300 text-xs font-mono text-emerald-900 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* ADMIN LIVE PRICING PREVIEW COMPONENT */}
                <div className="bg-dark text-cream p-4 border border-gold/40 space-y-2 font-mono text-xs shadow-inner">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gold flex items-center justify-between border-b border-gold/20 pb-1">
                    <span>Admin Pricing Preview</span>
                    <span>(Server-Authoritative)</span>
                  </div>

                  <div className="flex justify-between text-taupe">
                    <span>Base Subtotal ({quantity} units × ₹{unitPrice.toLocaleString('en-IN')})</span>
                    <span>₹{liveBaseSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {additionalCharges > 0 && (
                    <div className="flex justify-between text-taupe">
                      <span>+ Additional Fees / Customization</span>
                      <span>+₹{Number(additionalCharges).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>− Special Volume Discount</span>
                      <span>−₹{Number(discountAmount).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="border-t border-gold/30 pt-2 flex justify-between font-black text-sm text-gold">
                    <span>FINAL QUOTED AMOUNT</span>
                    <span>₹{liveFinalQuoteAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Quote Validity Expiry Date
                  </label>
                  <input
                    type="date"
                    value={quoteValidUntil}
                    onChange={(e) => setQuoteValidUntil(e.target.value)}
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-mono focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Status Lifecycle State *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-gold"
                  >
                    <option value="NEW">NEW ENQUIRY</option>
                    <option value="REVIEWING">UNDER REVIEW</option>
                    <option value="QUOTED">QUOTED (Send Quote)</option>
                    <option value="ACCEPTED">ACCEPTED (Ready for Checkout)</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Internal Admin Notes / Customer Terms
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter internal concierge notes or custom terms..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-parchment pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="px-4 py-2 bg-cream border border-parchment text-dark text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gold text-dark text-xs font-bold uppercase tracking-widest hover:bg-gold/90 transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Publish Quotation'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
