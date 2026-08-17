'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  MapPin, 
  User, 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  MessageCircle, 
  Package, 
  CreditCard, 
  ShieldCheck, 
  Smartphone,
  Wallet
} from 'lucide-react';
import { useCartStore } from '@/store/cart';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  whatsappUrl?: string;
  customerName: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
  deliveryAddress: string;
  isPaid?: boolean;
  paymentMethod?: string;
  paymentRef?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Accepted / Confirmed Screen
// ─────────────────────────────────────────────────────────────────────────────

function OrderAcceptedScreen({
  confirmation,
  onOpenWhatsApp,
}: {
  confirmation: OrderConfirmation;
  onOpenWhatsApp: () => void;
}) {
  return (
    <main className="min-h-screen bg-cream text-dark py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Status Badge */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className={`w-20 h-20 flex items-center justify-center ${confirmation.isPaid ? 'bg-emerald-800' : 'bg-gold-dark'}`}>
              <CheckCircle className="w-10 h-10 text-white stroke-[1.5]" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">THALF</span>
            <h1 className="font-editorial text-4xl sm:text-5xl font-light text-dark mt-1">
              {confirmation.isPaid ? 'Payment Confirmed' : 'Order Accepted'}
            </h1>
          </div>
          <p className="text-sm text-taupe font-light leading-relaxed max-w-md mx-auto">
            {confirmation.isPaid 
              ? 'Thank you for your payment. Your order has been confirmed and placed into production.'
              : 'Thank you for your order. Your order has been accepted by THALF and is being prepared for dispatch.'}
          </p>
        </div>

        {/* Order Number & Payment Status */}
        <div className="bg-champagne/60 border border-gold/30 p-5 text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">Order Number</span>
          <span className="font-editorial text-3xl font-light text-dark">{confirmation.orderNumber}</span>
          <div className="flex items-center justify-center space-x-2 pt-1">
            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 ${confirmation.isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
              {confirmation.isPaid ? '✓ Paid via Razorpay' : 'Pending Payment Confirmation'}
            </span>
          </div>
        </div>

        {/* Items Summary */}
        <div className="bg-white border border-parchment p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-parchment pb-3">
            <Package className="w-4 h-4 text-gold" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-dark">Your Order</h2>
          </div>
          <div className="space-y-3">
            {confirmation.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-gold font-bold text-[11px]">{item.quantity}×</span>
                  <span className="font-medium text-dark leading-snug">{item.productName}</span>
                </div>
                <span className="font-mono font-semibold text-dark">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-parchment flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-dark">Total</span>
            <span className="text-xl font-editorial font-bold text-dark">
              ₹{confirmation.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white border border-parchment p-5 space-y-2 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-parchment pb-3">
            <MapPin className="w-4 h-4 text-gold" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-dark">Delivery To</h2>
          </div>
          <p className="text-xs text-dark font-medium">{confirmation.customerName}</p>
          <p className="text-xs text-taupe leading-relaxed">{confirmation.deliveryAddress}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {confirmation.whatsappUrl && (
            <button
              onClick={onOpenWhatsApp}
              className="w-full py-4 bg-emerald-800 text-white hover:bg-emerald-700 text-xs uppercase tracking-ultra font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lux"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp for Updates</span>
            </button>
          )}
          <div className="text-center pt-2">
            <Link 
              href="/shop" 
              className="inline-block py-3 px-8 bg-gold text-dark font-bold text-xs uppercase tracking-wider hover:bg-gold-dark hover:text-white transition-all duration-300"
            >
              Back to Storefront
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkout Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Kerala');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Default to RAZORPAY online payment
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'WHATSAPP'>('RAZORPAY');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Order confirmation state
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);

  // Dynamically load Razorpay SDK
  useEffect(() => {
    if (!document.getElementById('razorpay-checkout-js')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Session autofill for authenticated customers
  useEffect(() => {
    async function loadCustomerSession() {
      try {
        const res = await fetch('/api/v1/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          if (data.user.name) setCustomerName(data.user.name);
          if (data.user.phone) {
            const rawPhone = data.user.phone.replace('+91', '').trim();
            setPhone(rawPhone);
          }
          if (data.user.email) setCustomerEmail(data.user.email);
        }
      } catch {
        // Guest checkout continuation
      }
    }
    loadCustomerSession();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isKerala = !state || state.trim().toLowerCase().includes('kerala');
  const deliveryFee = isKerala ? 80 : 100;
  const totalAmount = subtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your bag is empty. Please add products before checking out.');
      return;
    }

    if (!customerName.trim() || !phone.trim() || !street.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMessage('Please complete all required contact and delivery address fields.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (postalCode.trim().length < 6) {
      setErrorMessage('Please enter a valid 6-digit pincode.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order on server
      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          deliveryNotes: deliveryNotes.trim() || undefined,
          giftWrap: false,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      // 2. If Razorpay payment is selected & Razorpay order is returned -> Launch Razorpay Popup
      if (
        paymentMethod === 'RAZORPAY' &&
        data.razorpayOrderId &&
        (data.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
      ) {
        const keyId = data.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        const options = {
          key: keyId,
          amount: Math.round(data.totalAmount * 100),
          currency: 'INR',
          name: 'THALF Chocolates',
          description: `Order #${data.orderNumber}`,
          order_id: data.razorpayOrderId,
          prefill: {
            name: customerName,
            email: customerEmail || undefined,
            contact: phone,
          },
          theme: {
            color: '#1A0C08',
          },
          handler: async function (paymentResponse: any) {
            try {
              const verifyRes = await fetch('/api/v1/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderId,
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                clearCart();
                setConfirmation({
                  orderId: data.orderId,
                  orderNumber: data.orderNumber,
                  totalAmount: data.totalAmount,
                  whatsappUrl: data.whatsappUrl || '',
                  customerName,
                  isPaid: true,
                  paymentMethod: 'RAZORPAY',
                  paymentRef: paymentResponse.razorpay_payment_id,
                  items: items.map((i) => ({
                    productName: i.productName,
                    quantity: i.quantity,
                    price: i.price,
                  })),
                  deliveryAddress: [street, city, state, postalCode].filter(Boolean).join(', '),
                });
              } else {
                setErrorMessage(verifyData.error || 'Payment verification failed.');
                setIsSubmitting(false);
              }
            } catch (err: any) {
              setErrorMessage(err.message || 'Payment verification failed.');
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const RazorpayWindow = (window as any).Razorpay;
        if (RazorpayWindow) {
          const rzp = new RazorpayWindow(options);
          rzp.open();
          return;
        }
      }

      // 3. Fallback or WhatsApp payment selection
      clearCart();
      setConfirmation({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        totalAmount: data.totalAmount,
        whatsappUrl: data.whatsappUrl,
        customerName,
        isPaid: false,
        paymentMethod: 'WHATSAPP',
        items: items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
        })),
        deliveryAddress: [street, city, state, postalCode].filter(Boolean).join(', '),
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  // ── Order Confirmed Screen ──────────────────────────────────────────────────
  if (confirmation) {
    return (
      <OrderAcceptedScreen
        confirmation={confirmation}
        onOpenWhatsApp={() => {
          if (confirmation.whatsappUrl) {
            window.open(confirmation.whatsappUrl, '_blank', 'noopener,noreferrer');
          }
        }}
      />
    );
  }

  // ── Checkout Form Screen ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-cream text-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Navigation back to shop */}
        <div className="flex items-center justify-between border-b border-parchment pb-4">
          <Link href="/shop" className="inline-flex items-center text-xs text-taupe hover:text-dark uppercase tracking-wider font-semibold">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Continue Shopping
          </Link>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">THALF</span>
            <h1 className="font-editorial text-2xl text-dark">Checkout</h1>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left: Contact, Address, Payment Method Selection ──────────── */}
          <div className="lg:col-span-7 space-y-8">

            {/* Contact Details */}
            <div className="bg-white border border-parchment p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-parchment pb-3">
                <User className="w-4 h-4 text-gold" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-dark">1. Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs text-dark focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe mb-1">Mobile Phone (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs text-dark focus:border-gold outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs text-dark focus:border-gold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white border border-parchment p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-parchment pb-3">
                <MapPin className="w-4 h-4 text-gold" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-dark">2. Delivery Address</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe mb-1">Flat, House no., Building, Street *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Oakwood Apartments, MG Road"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs text-dark focus:border-gold outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs text-dark focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs text-dark focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="400001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs text-dark focus:border-gold outline-none font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe mb-1">Delivery Instructions / Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Leave at gate security or Ring doorbell"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full px-3 py-2.5 bg-cream border border-parchment text-xs text-dark focus:border-gold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white border border-parchment p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-parchment pb-3">
                <CreditCard className="w-4 h-4 text-gold" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-dark">3. Select Payment Method</h2>
              </div>
              <div className="space-y-3">

                {/* Razorpay Online Payment Option */}
                <label 
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`flex items-start justify-between p-4 cursor-pointer border transition-all duration-200 ${
                    paymentMethod === 'RAZORPAY' 
                      ? 'border-gold bg-champagne/20 ring-1 ring-gold/40' 
                      : 'border-parchment hover:border-gold/50 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      className="mt-1 text-gold focus:ring-gold"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-dark">Razorpay Online Payment</span>
                        <span className="text-[9px] bg-emerald-800 text-white font-bold px-1.5 py-0.5 tracking-wider uppercase">Instant</span>
                      </div>
                      <p className="text-[11px] text-taupe mt-1">
                        Pay securely using UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, or Wallets.
                      </p>
                      <div className="flex items-center space-x-3 mt-2 text-taupe">
                        <Smartphone className="w-3.5 h-3.5 text-gold" />
                        <CreditCard className="w-3.5 h-3.5 text-gold" />
                        <Wallet className="w-3.5 h-3.5 text-gold" />
                        <span className="text-[10px] font-mono text-dark/70">Razorpay Gateway Test Mode Active</span>
                      </div>
                    </div>
                  </div>
                </label>

                {/* WhatsApp Assisted Payment Option */}
                <label 
                  onClick={() => setPaymentMethod('WHATSAPP')}
                  className={`flex items-start justify-between p-4 cursor-pointer border transition-all duration-200 ${
                    paymentMethod === 'WHATSAPP' 
                      ? 'border-gold bg-champagne/20 ring-1 ring-gold/40' 
                      : 'border-parchment hover:border-gold/50 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'WHATSAPP'}
                      onChange={() => setPaymentMethod('WHATSAPP')}
                      className="mt-1 text-gold focus:ring-gold"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-dark">WhatsApp Assisted Order</span>
                      </div>
                      <p className="text-[11px] text-taupe mt-1">
                        Place your order now and complete payment confirmation with THALF Concierge via WhatsApp.
                      </p>
                    </div>
                  </div>
                </label>

              </div>
            </div>

          </div>

          {/* ── Right: Order Summary ──────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-cream border border-parchment p-6 shadow-lux space-y-6 sticky top-8">

              <h2 className="text-xs font-bold uppercase tracking-wider text-dark border-b border-parchment pb-3">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || 'd'}`} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-gold font-bold text-[11px]">{item.quantity}×</span>
                      <span className="font-serif text-dark font-medium leading-snug line-clamp-1">{item.productName}</span>
                    </div>
                    <span className="font-mono font-semibold text-dark">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-taupe pt-4 border-t border-parchment">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-dark font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({isKerala ? 'Kerala' : 'Outside Kerala'})</span>
                  <span className="text-dark font-mono font-semibold">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-serif font-bold text-dark pt-3 border-t border-parchment">
                  <span>Total</span>
                  <span className="text-gold-dark font-mono text-xl">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gold text-dark hover:bg-gold-dark hover:text-white text-xs uppercase tracking-ultra font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lux disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /><span>Processing Checkout...</span></>
                ) : paymentMethod === 'RAZORPAY' ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay Online ₹{totalAmount.toLocaleString('en-IN')}</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Place Order via WhatsApp</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-parchment/40 text-[10px] text-center text-taupe leading-relaxed border border-parchment/60 flex items-center justify-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>
                  {paymentMethod === 'RAZORPAY' 
                    ? 'Encrypted 256-bit Razorpay Checkout (UPI, Cards, NetBanking, Wallets).' 
                    : 'Your order details will be created and forwarded to THALF Concierge.'}
                </span>
              </div>

            </div>
          </div>

        </form>
      </div>
    </main>
  );
}
