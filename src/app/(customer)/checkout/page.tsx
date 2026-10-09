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
    <main className="min-h-screen bg-[#100805] text-[#F4EBDD] py-20 px-4 sm:px-6 lg:px-8 selection:bg-[#B88A42] selection:text-[#100805]">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Status Badge */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className={`w-20 h-20 flex items-center justify-center border ${confirmation.isPaid ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400' : 'bg-[#170B07] border-[#B88A42]/50 text-[#B88A42]'}`}>
              <CheckCircle className="w-10 h-10 stroke-[1.5]" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A42] block">THALF CHOCOLATES</span>
            <h1 className="font-editorial text-4xl sm:text-5xl font-light text-[#F4EBDD] mt-1">
              {confirmation.isPaid ? 'Payment Confirmed' : 'Order Accepted'}
            </h1>
          </div>
          <p className="text-sm text-[#B9AA99] font-light leading-relaxed max-w-md mx-auto">
            {confirmation.isPaid 
              ? 'Thank you for your payment. Your artisanal order has been confirmed and placed into production.'
              : 'Thank you for your order. Your creation has been accepted by THALF and is being prepared for express dispatch.'}
          </p>
        </div>

        {/* Order Number & Payment Status */}
        <div className="bg-[#170B07] border border-[#B88A42]/30 p-6 text-center space-y-2.5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A42] block">Order Identifier</span>
          <span className="font-editorial text-3xl font-light text-[#F4EBDD]">{confirmation.orderNumber}</span>
          <div className="flex items-center justify-center space-x-2 pt-1">
            <span className={`text-[10px] font-bold uppercase px-3 py-1 font-mono border ${confirmation.isPaid ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600/40' : 'bg-[#2E1A10] text-[#D09A4E] border-[#B88A42]/40'}`}>
              {confirmation.isPaid ? '✓ Paid via Razorpay' : 'Pending Payment Confirmation'}
            </span>
          </div>
        </div>

        {/* Items Summary */}
        <div className="bg-[#170B07] border border-[#B88A42]/25 p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-[#B88A42]/20 pb-3">
            <Package className="w-4 h-4 text-[#B88A42]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#B88A42]">Curated Selection</h2>
          </div>
          <div className="space-y-3">
            {confirmation.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[#B88A42] font-bold text-[11px]">{item.quantity}×</span>
                  <span className="font-medium text-[#F4EBDD] leading-snug">{item.productName}</span>
                </div>
                <span className="font-mono font-semibold text-[#F4EBDD]">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-[#B88A42]/20 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B9AA99]">Total Amount</span>
            <span className="text-2xl font-editorial font-bold text-[#F4EBDD]">
              ₹{confirmation.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-[#170B07] border border-[#B88A42]/25 p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#B88A42]/20 pb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#B88A42]" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#B88A42]">Destination</h2>
            </div>
            <span className="text-[10px] font-bold uppercase bg-[#100805] text-[#D09A4E] border border-[#B88A42]/30 px-2 py-0.5">
              Est: {confirmation.deliveryAddress.toLowerCase().includes('kerala') ? '3 Days' : '5-6 Days'}
            </span>
          </div>
          <p className="text-xs text-[#F4EBDD] font-medium">{confirmation.customerName}</p>
          <p className="text-xs text-[#B9AA99] leading-relaxed">{confirmation.deliveryAddress}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {confirmation.whatsappUrl && (
            <button
              onClick={onOpenWhatsApp}
              suppressHydrationWarning
              className="w-full py-4 bg-emerald-800 text-white hover:bg-emerald-700 text-xs uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp for Updates</span>
            </button>
          )}
          <div className="text-center pt-2">
            <Link 
              href="/shop" 
              className="inline-block py-3.5 px-8 bg-[#B88A42] text-[#100805] font-bold text-xs uppercase tracking-widest hover:bg-[#D09A4E] transition-all duration-300 shadow-lg"
            >
              Return to Storefront
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

  // Helper to load Razorpay checkout SDK
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const existingScript = document.getElementById('razorpay-checkout-js') as HTMLScriptElement | null;
      if (existingScript) {
        if ((window as any).Razorpay) return resolve(true);
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Pre-load Razorpay SDK on mount
  useEffect(() => {
    loadRazorpayScript();
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

      // 2. If Razorpay payment is selected -> Launch Razorpay Popup
      if (paymentMethod === 'RAZORPAY') {
        if (!data.razorpayOrderId) {
          setIsSubmitting(false);
          setErrorMessage(
            data.razorpayError ||
            'Razorpay payment could not be initialized. Please check your Razorpay environment variables (NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET).'
          );
          return;
        }

        const isLoaded = await loadRazorpayScript();
        const RazorpayWindow = (window as any).Razorpay;

        if (!isLoaded || !RazorpayWindow) {
          setIsSubmitting(false);
          setErrorMessage('Unable to load Razorpay payment SDK. Please verify your network and try again.');
          return;
        }

        const keyId = data.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TltSSJaQwEeCME';

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

        const rzp = new RazorpayWindow(options);
        rzp.on('payment.failed', function (resp: any) {
          setIsSubmitting(false);
          setErrorMessage(resp.error?.description || 'Payment was declined or failed.');
        });
        rzp.open();
        return;
      }

      // 3. WhatsApp payment selection
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
    <main className="min-h-screen bg-[#100805] text-[#F4EBDD] py-14 px-4 sm:px-6 lg:px-8 selection:bg-[#B88A42] selection:text-[#100805]">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Navigation back to shop */}
        <div className="flex items-center justify-between border-b border-[#B88A42]/20 pb-4">
          <Link href="/shop" className="inline-flex items-center text-xs text-[#B9AA99] hover:text-[#B88A42] uppercase tracking-wider font-semibold transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Continue Shopping
          </Link>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A42] block">THALF</span>
            <h1 className="font-editorial text-2xl text-[#F4EBDD]">Checkout</h1>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-[#2E1208] border border-red-800/60 text-red-200 p-4 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left: Contact, Address, Payment Method Selection ──────────── */}
          <div className="lg:col-span-7 space-y-8">

            {/* Contact Details */}
            <div className="bg-[#170B07] border border-[#B88A42]/25 p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#B88A42]/20 pb-3">
                <User className="w-4 h-4 text-[#B88A42]" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#B88A42]">1. Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B9AA99] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#100805] border border-[#B88A42]/30 text-xs text-[#F4EBDD] focus:border-[#B88A42] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B9AA99] mb-1">Mobile Phone (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#100805] border border-[#B88A42]/30 text-xs text-[#F4EBDD] focus:border-[#B88A42] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B9AA99] mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#100805] border border-[#B88A42]/30 text-xs text-[#F4EBDD] focus:border-[#B88A42] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-[#170B07] border border-[#B88A42]/25 p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#B88A42]/20 pb-3">
                <MapPin className="w-4 h-4 text-[#B88A42]" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#B88A42]">2. Delivery Address</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B9AA99] mb-1">Flat, House no., Building, Street *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Oakwood Apartments, MG Road"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#100805] border border-[#B88A42]/30 text-xs text-[#F4EBDD] focus:border-[#B88A42] outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B9AA99] mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Kochi / Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#100805] border border-[#B88A42]/30 text-xs text-[#F4EBDD] focus:border-[#B88A42] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B9AA99] mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="Kerala / Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#100805] border border-[#B88A42]/30 text-xs text-[#F4EBDD] focus:border-[#B88A42] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B9AA99] mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="682001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#100805] border border-[#B88A42]/30 text-xs text-[#F4EBDD] focus:border-[#B88A42] outline-none font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B9AA99] mb-1">Delivery Instructions / Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Leave at concierge reception"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#100805] border border-[#B88A42]/30 text-xs text-[#F4EBDD] focus:border-[#B88A42] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-[#170B07] border border-[#B88A42]/25 p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#B88A42]/20 pb-3">
                <CreditCard className="w-4 h-4 text-[#B88A42]" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#B88A42]">3. Select Payment Method</h2>
              </div>
              <div className="space-y-3">

                {/* Razorpay Online Payment Option */}
                <label 
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`flex items-start justify-between p-4 cursor-pointer border transition-all duration-200 ${
                    paymentMethod === 'RAZORPAY' 
                      ? 'border-[#B88A42] bg-[#24130C] ring-1 ring-[#B88A42]/50' 
                      : 'border-[#B88A42]/20 hover:border-[#B88A42]/50 bg-[#100805]'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      className="mt-1 text-[#B88A42] focus:ring-[#B88A42]"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#F4EBDD]">Razorpay Online Payment</span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 tracking-wider uppercase border border-emerald-800/40">Instant</span>
                      </div>
                      <p className="text-[11px] text-[#B9AA99] mt-1">
                        Pay securely using UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, or Wallets.
                      </p>
                      <div className="flex items-center space-x-3 mt-2 text-[#B9AA99]">
                        <Smartphone className="w-3.5 h-3.5 text-[#B88A42]" />
                        <CreditCard className="w-3.5 h-3.5 text-[#B88A42]" />
                        <Wallet className="w-3.5 h-3.5 text-[#B88A42]" />
                        <span className="text-[10px] font-mono text-[#B9AA99]/70">Razorpay Gateway Encrypted</span>
                      </div>
                    </div>
                  </div>
                </label>

                {/* WhatsApp Assisted Payment Option */}
                <label 
                  onClick={() => setPaymentMethod('WHATSAPP')}
                  className={`flex items-start justify-between p-4 cursor-pointer border transition-all duration-200 ${
                    paymentMethod === 'WHATSAPP' 
                      ? 'border-[#B88A42] bg-[#24130C] ring-1 ring-[#B88A42]/50' 
                      : 'border-[#B88A42]/20 hover:border-[#B88A42]/50 bg-[#100805]'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'WHATSAPP'}
                      onChange={() => setPaymentMethod('WHATSAPP')}
                      className="mt-1 text-[#B88A42] focus:ring-[#B88A42]"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#F4EBDD]">WhatsApp Assisted Order</span>
                      </div>
                      <p className="text-[11px] text-[#B9AA99] mt-1">
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
            <div className="bg-[#170B07] border border-[#B88A42]/25 p-6 shadow-2xl space-y-6 sticky top-28">

              <h2 className="text-xs font-bold uppercase tracking-widest text-[#B88A42] border-b border-[#B88A42]/20 pb-3">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || 'd'}`} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[#B88A42] font-bold text-[11px]">{item.quantity}×</span>
                      <span className="text-[#F4EBDD] font-light leading-snug line-clamp-1">{item.productName}</span>
                    </div>
                    <span className="font-mono font-semibold text-[#F4EBDD]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-[#B9AA99] pt-4 border-t border-[#B88A42]/20">
                <div className="flex justify-between">
                  <span>Artisanal Subtotal</span>
                  <span className="text-[#F4EBDD] font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Delivery ({isKerala ? 'Kerala • 3 Days' : 'Outside Kerala • 5-6 Days'})</span>
                  <span className="text-[#F4EBDD] font-mono font-semibold">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-base font-editorial font-bold text-[#F4EBDD] pt-3 border-t border-[#B88A42]/20">
                  <span>Total Amount</span>
                  <span className="text-[#D09A4E] font-mono text-xl">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                suppressHydrationWarning
                className="w-full py-4 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
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

              <div className="p-3 bg-[#100805] text-[10px] text-center text-[#B9AA99] leading-relaxed border border-[#B88A42]/20 flex items-center justify-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B88A42] shrink-0" />
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
