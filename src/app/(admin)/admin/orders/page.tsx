'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  AlertCircle, 
  DollarSign, 
  History, 
  ShieldCheck, 
  X,
  RotateCcw,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { AdminNotificationToggle } from '@/components/admin/admin-notification-toggle';

interface OrderItemData {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    name: string;
    sku: string;
  } | null;
}

interface StatusHistoryItem {
  id: string;
  previousStatus: string | null;
  newStatus: string;
  changedBy: string;
  note: string | null;
  createdAt: string;
}

interface ReturnRequestRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  reason: string;
  requestType: string;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  deliveryNotes: string | null;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'PREPARING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  shippingAmount: number;
  giftWrapAmount: number;
  discountAmount: number;
  totalAmount: number;
  giftWrap: boolean;
  giftMessage: string | null;
  giftRibbon: string | null;
  createdAt: string;
  payment: {
    status: 'UNPAID' | 'PAID' | 'REFUNDED';
    provider: string;
    transactionRef: string | null;
    paidAt: string | null;
  } | null;
  orderItems: OrderItemData[];
  statusHistory: StatusHistoryItem[];
  returnRequests?: ReturnRequestRecord[];
  whatsappNotificationStatus?: string | null;
  whatsappNotifiedAt?: string | null;
  whatsappErrorMessage?: string | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // New Return/Refund logging state
  const [showLogReturnForm, setShowLogReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('Melted/Damaged Chocolate during transit');
  const [returnType, setReturnType] = useState<'RETURN' | 'REPLACEMENT' | 'REFUND'>('REPLACEMENT');
  const [returnAdminNote, setReturnAdminNote] = useState('');
  
  const [orderToRefund, setOrderToRefund] = useState<OrderRecord | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      try {
        setLoading(true);
        const url = new URL('/api/v1/admin/orders', window.location.origin);
        if (activeTab !== 'ALL') url.searchParams.set('status', activeTab);
        if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim());

        const res = await fetch(url.toString());
        const data = await res.json();
        if (isMounted && data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        setPageError('Failed to fetch orders from server.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOrders();
    return () => { isMounted = false; };
  }, [activeTab, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/v1/admin/orders', window.location.origin);
      if (activeTab !== 'ALL') url.searchParams.set('status', activeTab);
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      setPageError('Failed to fetch orders from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (
    orderId: string, 
    action: 'CONFIRM' | 'MARK_PAID' | 'UPDATE_STATUS' | 'MARK_REFUNDED' | 'RECORD_RETURN_REQUEST' | 'UPDATE_RETURN_STATUS', 
    statusPayload?: string,
    extraPayload?: Record<string, any>
  ) => {
    setActionError(null);
    setActionSuccess(null);
    setProcessing(true);

    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          status: statusPayload,
          ...extraPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Action failed.');
      }

      setActionSuccess(`Order ${data.order.orderNumber} updated successfully.`);
      setSelectedOrder(data.order);
      setShowLogReturnForm(false);
      fetchOrders();
    } catch (err: any) {
      setActionError(err.message || 'Operation failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Order Desk</span>
        <h1 className="text-3xl font-serif font-black uppercase tracking-wider text-dark mt-1">
          Fulfillment & Return Console
        </h1>
      </div>

      <AdminNotificationToggle />

      {pageError && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="font-semibold">{pageError}</span>
          </div>
          <button onClick={() => setPageError(null)} className="text-red-800 hover:text-red-900"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-parchment overflow-x-auto space-x-2">
        {['ALL', 'PENDING_CONFIRMATION', 'CONFIRMED', 'PREPARING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-gold text-dark bg-cream'
                : 'border-transparent text-dark/60 hover:text-dark'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-cream border border-parchment p-4 shadow-lux flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/40" />
          <input
            type="text"
            placeholder="Search orders by order number, customer name, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
          />
        </div>
        <span className="text-[10px] font-bold uppercase text-dark/60">{orders.length} Orders</span>
      </div>

      {/* Orders Table */}
      <div className="bg-cream border border-parchment shadow-lux overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-dark/50">Loading orders from database...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-dark/50">No orders found matching search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-parchment text-dark/60 uppercase text-[9px] font-bold tracking-wider bg-parchment/30">
                  <th className="py-4 px-4">Order Number</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Phone</th>
                  <th className="py-4 px-4">Payable</th>
                  <th className="py-4 px-4">Payment</th>
                  <th className="py-4 px-4">Order Status</th>
                  <th className="py-4 px-4">WhatsApp Alert</th>
                  <th className="py-4 px-4">Return / Claim</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment/40">
                {orders.map(o => {
                  const hasReturnReq = o.returnRequests && o.returnRequests.length > 0;
                  const latestReq = hasReturnReq ? o.returnRequests![0] : null;

                  return (
                    <tr key={o.id} className="hover:bg-parchment/20 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-dark text-xs">
                        #{o.orderNumber}
                      </td>

                      <td className="py-4 px-4 font-semibold text-dark">
                        {o.customerName}
                      </td>

                      <td className="py-4 px-4 font-mono text-dark/70">
                        {o.customerPhone}
                      </td>

                      <td className="py-4 px-4 font-serif font-bold text-gold">
                        ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          o.payment?.status === 'PAID' ? 'bg-green-100 text-green-800 border border-green-300' :
                          o.payment?.status === 'REFUNDED' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                          'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {o.payment?.status || 'UNPAID'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          o.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          o.status === 'PENDING_CONFIRMATION' ? 'bg-amber-100 text-amber-800' :
                          o.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-gold-light text-dark'
                        }`}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center w-max ${
                          o.whatsappNotificationStatus === 'SENT' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          o.whatsappNotificationStatus === 'FAILED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}>
                          {o.whatsappNotificationStatus === 'SENT' ? '✓ Sent' :
                           o.whatsappNotificationStatus === 'FAILED' ? '⚠ Failed' :
                           'Pending'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {latestReq ? (
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            latestReq.status === 'REQUESTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            latestReq.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            latestReq.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {latestReq.requestType}: {latestReq.status}
                          </span>
                        ) : (
                          <span className="text-[9px] text-dark/40 font-mono">None</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setActionError(null);
                            setActionSuccess(null);
                            setShowLogReturnForm(false);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-dark text-cream hover:bg-gold hover:text-dark text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Manifest
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manifest & Action Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-cream border-l border-parchment h-full overflow-y-auto p-6 shadow-2xl space-y-6 relative animate-slide-in-right">
            
            <div className="flex items-center justify-between border-b border-parchment pb-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Manifest & Claim Desk</span>
                <h2 className="text-2xl font-mono font-bold text-dark">#{selectedOrder.orderNumber}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-dark/50 hover:text-dark">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Notifications */}
            {actionError && (
              <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}
            {actionSuccess && (
              <div className="p-3 bg-green-100 border border-green-300 text-green-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Admin Action Buttons */}
            <div className="p-4 bg-parchment/40 border border-parchment space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dark/70 block">
                Fulfillment Controls
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === 'PENDING_CONFIRMATION' && (
                  <button
                    disabled={processing}
                    onClick={() => handleAdminAction(selectedOrder.id, 'CONFIRM')}
                    className="px-4 py-2 bg-green-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-green-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    Confirm Order & Commit Stock
                  </button>
                )}

                {selectedOrder.payment?.status === 'UNPAID' && (
                  <button
                    disabled={processing}
                    onClick={() => handleAdminAction(selectedOrder.id, 'MARK_PAID')}
                    className="px-4 py-2 bg-gold text-dark text-xs font-bold uppercase tracking-wider hover:bg-gold-dark transition-colors shadow-sm disabled:opacity-50"
                  >
                    Mark Payment Received
                  </button>
                )}

                {selectedOrder.payment?.status !== 'REFUNDED' && (
                  <button
                    disabled={processing}
                    onClick={() => setOrderToRefund(selectedOrder)}
                    className="px-3 py-2 bg-purple-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-900 transition-colors shadow-sm disabled:opacity-50"
                  >
                    Mark Order Refunded
                  </button>
                )}

                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    disabled={processing}
                    onClick={() => handleAdminAction(selectedOrder.id, 'UPDATE_STATUS', 'PREPARING')}
                    className="px-3 py-2 bg-dark text-cream text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-dark transition-colors"
                  >
                    Start Preparing
                  </button>
                )}

                {selectedOrder.status === 'PREPARING' && (
                  <button
                    disabled={processing}
                    onClick={() => handleAdminAction(selectedOrder.id, 'UPDATE_STATUS', 'PACKED')}
                    className="px-3 py-2 bg-dark text-cream text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-dark transition-colors"
                  >
                    Mark Packed
                  </button>
                )}

                {selectedOrder.status === 'PACKED' && (
                  <button
                    disabled={processing}
                    onClick={() => handleAdminAction(selectedOrder.id, 'UPDATE_STATUS', 'SHIPPED')}
                    className="px-3 py-2 bg-dark text-cream text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-dark transition-colors"
                  >
                    Mark Shipped
                  </button>
                )}

                {selectedOrder.status === 'SHIPPED' && (
                  <button
                    disabled={processing}
                    onClick={() => handleAdminAction(selectedOrder.id, 'UPDATE_STATUS', 'DELIVERED')}
                    className="px-3 py-2 bg-green-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-green-900 transition-colors"
                  >
                    Mark Delivered
                  </button>
                )}

                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                  <button
                    disabled={processing}
                    onClick={() => handleAdminAction(selectedOrder.id, 'UPDATE_STATUS', 'CANCELLED')}
                    className="px-3 py-2 bg-rose-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-800 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* SECTION: Return / Replacement / Refund Claims Workflow */}
            <div className="p-4 bg-cream border border-gold/40 shadow-lux space-y-4">
              <div className="flex items-center justify-between border-b border-parchment pb-2">
                <span className="text-xs font-bold uppercase text-dark flex items-center">
                  <RotateCcw className="h-4 w-4 mr-2 text-gold" /> Return / Replacement / Refund Claims
                </span>
                <button
                  onClick={() => setShowLogReturnForm(!showLogReturnForm)}
                  className="px-2 py-1 bg-gold/10 border border-gold/40 text-dark text-[10px] font-bold uppercase hover:bg-gold hover:text-dark transition-colors"
                >
                  {showLogReturnForm ? 'Cancel' : '+ Record WhatsApp Claim'}
                </button>
              </div>

              {/* Form to log a claim */}
              {showLogReturnForm && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAdminAction(selectedOrder.id, 'RECORD_RETURN_REQUEST', undefined, {
                      reason: returnReason,
                      requestType: returnType,
                      returnStatus: 'REQUESTED',
                      adminNote: returnAdminNote,
                    });
                  }}
                  className="bg-parchment/30 p-4 border border-parchment space-y-3 text-xs"
                >
                  <span className="font-bold text-dark block text-[10px] uppercase">Record Incoming WhatsApp Claim</span>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-dark/70 mb-1">Request Category:</label>
                    <select 
                      value={returnType} 
                      onChange={(e) => setReturnType(e.target.value as any)}
                      className="w-full p-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                    >
                      <option value="REPLACEMENT">Replacement (Damaged / Melted / Wrong Item)</option>
                      <option value="REFUND">Monetary Refund Request</option>
                      <option value="RETURN">Return Query</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-dark/70 mb-1">Reason / Description:</label>
                    <textarea 
                      rows={2} 
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full p-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-dark/70 mb-1">Admin Internal Note:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. WhatsApp video proof received, replacement approved"
                      value={returnAdminNote}
                      onChange={(e) => setReturnAdminNote(e.target.value)}
                      className="w-full p-2 bg-cream border border-parchment text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={processing}
                    className="px-4 py-2 bg-dark text-cream font-bold text-xs uppercase hover:bg-gold hover:text-dark transition-colors"
                  >
                    Save Return Claim
                  </button>
                </form>
              )}

              {/* Display list of Return Requests */}
              {selectedOrder.returnRequests && selectedOrder.returnRequests.length > 0 ? (
                <div className="space-y-3">
                  {selectedOrder.returnRequests.map((rr) => (
                    <div key={rr.id} className="p-3 bg-parchment/20 border border-parchment space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-dark uppercase text-[10px]">{rr.requestType} CLAIM</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          rr.status === 'REQUESTED' ? 'bg-rose-100 text-rose-800' :
                          rr.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' :
                          rr.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          rr.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rr.status}
                        </span>
                      </div>
                      <p className="text-dark/80 font-sans"><strong>Reason:</strong> {rr.reason}</p>
                      {rr.adminNote && <p className="text-dark/70 italic text-[11px]"><strong>Admin Note:</strong> {rr.adminNote}</p>}
                      <span className="text-[9px] font-mono text-dark/40 block">Reported: {new Date(rr.createdAt).toLocaleString()}</span>

                      {/* State Transition Actions */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-parchment/60">
                        {['REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED'].map((st) => (
                          <button
                            key={st}
                            disabled={processing || rr.status === st}
                            onClick={() => handleAdminAction(selectedOrder.id, 'UPDATE_RETURN_STATUS', undefined, {
                              requestId: rr.id,
                              returnStatus: st,
                              adminNote: `Status changed to ${st} via Order Desk`,
                            })}
                            className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider border ${
                              rr.status === st 
                                ? 'bg-gold text-dark border-gold cursor-default' 
                                : 'bg-cream text-dark/70 border-parchment hover:border-gold hover:text-dark'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-dark/50 italic">No return or replacement claims logged for this order.</p>
              )}
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-cream border border-parchment p-4 space-y-1">
                <span className="text-[9px] font-bold uppercase text-gold">Patron</span>
                <p className="font-bold text-dark">{selectedOrder.customerName}</p>
                <p className="font-mono text-dark/70">{selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && <p className="text-dark/60">{selectedOrder.customerEmail}</p>}
              </div>

              <div className="bg-cream border border-parchment p-4 space-y-1">
                <span className="text-[9px] font-bold uppercase text-gold">Delivery Address</span>
                <p className="text-dark">{selectedOrder.street}</p>
                <p className="text-dark/70">{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.postalCode}</p>
              </div>
            </div>

            {/* Items Manifest Table */}
            <div className="bg-cream border border-parchment p-4 space-y-3">
              <span className="text-xs font-bold uppercase text-dark">Order Items</span>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-parchment text-dark/50 text-[9px] uppercase font-bold">
                    <th className="py-2">Creation</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-parchment/40">
                  {selectedOrder.orderItems.map(item => (
                    <tr key={item.id}>
                      <td className="py-2.5 font-serif font-bold text-dark">
                        {item.product?.name || 'Artisanal Creation'}
                        {item.product?.sku && (
                          <span className="text-[10px] text-dark/50 font-mono block">{item.product.sku}</span>
                        )}
                      </td>
                      <td className="py-2.5 font-mono">{item.quantity}×</td>
                      <td className="py-2.5 text-right font-mono font-bold text-gold">
                        ₹{Number(item.totalPrice).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-3 border-t border-parchment text-xs space-y-1">
                <div className="flex justify-between text-dark/70">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-dark/70">
                  <span>Express Courier Delivery</span>
                  <span className="font-mono">₹{Number(selectedOrder.shippingAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-serif font-bold text-sm text-dark pt-2 border-t border-parchment">
                  <span>Total Payable</span>
                  <span className="font-mono text-gold-dark">₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* OrderStatusHistory Timeline */}
            <div className="bg-cream border border-parchment p-4 space-y-3">
              <span className="text-xs font-bold uppercase text-dark flex items-center">
                <History className="h-4 w-4 mr-2 text-gold" /> Order Status History Timeline
              </span>

              <div className="space-y-3 relative border-l-2 border-parchment pl-4 ml-2">
                {selectedOrder.statusHistory.map((h) => (
                  <div key={h.id} className="relative text-xs space-y-0.5">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-gold" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-dark text-[10px]">{h.newStatus.replace('_', ' ')}</span>
                      <span className="text-[9px] font-mono text-dark/50">{new Date(h.createdAt).toLocaleString()}</span>
                    </div>
                    {h.note && <p className="text-dark/70 italic text-[11px]">&ldquo;{h.note}&rdquo;</p>}
                    <span className="text-[9px] text-dark/40 font-mono block">Updated by: {h.changedBy}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!orderToRefund}
        title="Process Refund"
        description={orderToRefund ? `Are you sure you want to explicitly process a REFUND for order #${orderToRefund.orderNumber}?` : ''}
        confirmLabel="Process Refund"
        isProcessing={processing}
        isDestructive={true}
        onConfirm={() => {
          if (orderToRefund) {
            handleAdminAction(orderToRefund.id, 'MARK_REFUNDED', undefined, { note: 'Explicit Admin refund approval via WhatsApp claim' })
              .finally(() => setOrderToRefund(null));
          }
        }}
        onCancel={() => setOrderToRefund(null)}
      />

    </div>
  );
}
