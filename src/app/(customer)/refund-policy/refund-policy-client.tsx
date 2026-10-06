'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown,
  ChevronUp,
  FileCheck2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Ban,
  PackageX
} from 'lucide-react';

interface WhatsAppSettings {
  phoneNumber: string;
  displayName: string;
  enabled: boolean;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const REFUND_FAQS: FAQItem[] = [
  {
    question: 'How long will it take for my refund to appear in my account?',
    answer: 'Once approved by THALF Admin, refunds are processed immediately through our secure payment gateway (Razorpay) back to your original source payment method. UPI transfers reflect within 24 to 48 hours; Net Banking takes 3 to 5 business days; and Credit/Debit Cards take 5 to 7 business days depending on your issuing bank. Store credit vouchers are issued within 2 hours.'
  },
  {
    question: 'Can I receive my refund in cash or to an alternative bank account?',
    answer: 'No. In compliance with Reserve Bank of India (RBI) payment guidelines and anti-money laundering (AML) protocols, all electronic refunds are strictly reversed to the exact original payment instrument used during checkout. Transfers to third-party accounts or cash payouts are prohibited.'
  },
  {
    question: 'What if money was deducted from my account, but my order was not confirmed?',
    answer: 'This is an automatic payment gateway timeout where funds are held in transit. Razorpay and your issuing bank automatically reconcile and reverse unconfirmed transactions within 24 to 48 hours. If your funds do not reflect within 48 hours, contact our Concierge with your payment screenshot and bank UTR reference.'
  },
  {
    question: 'Can I cancel my order after paying online?',
    answer: 'Orders can only be cancelled within 1 hour of placement or before our kitchen begins temperature-controlled packing and batch allocation. Once an order is marked as "Dispatched" or handed over to our courier partners, cancellation is strictly not possible. If cancelled within the eligible window, a 100% full refund is issued automatically.'
  },
  {
    question: 'How do THALF Store Credit Vouchers work?',
    answer: 'If you prefer store credit over a bank refund, our Concierge issues a digital Atelier Voucher code sent directly via WhatsApp or email. The voucher is loaded with 100% of your claim value, has zero convenience fees, and remains valid for 12 months across all handcrafted chocolate creations and seasonal hampers.'
  }
];

export default function RefundPolicyClient() {
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppSettings>({
    phoneNumber: '919061107915',
    displayName: 'THALF Artisanal Concierge',
    enabled: true,
  });
  const [userOrders, setUserOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('');
  const [requestType, setRequestType] = useState<
    'Monetary Refund Request' | 'Order Cancellation (Pre-Dispatch)' | 'Store Credit Voucher' | 'Failed Payment / Deducted Amount' | 'General Refund Query'
  >('Monetary Refund Request');
  const [customOrderInput, setCustomOrderInput] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    async function fetchWhatsAppConfig() {
      try {
        const res = await fetch('/api/v1/settings/whatsapp');
        const data = await res.json();
        if (data.success && data.phoneNumber) {
          setWhatsappConfig({
            phoneNumber: data.phoneNumber.replace(/\D/g, ''),
            displayName: data.displayName || 'THALF Artisanal Concierge',
            enabled: data.enabled !== false,
          });
        }
      } catch {
        // Fallback silently
      }
    }

    async function fetchCustomerOrders() {
      try {
        const res = await fetch('/api/v1/orders');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const mapped: CustomerOrder[] = data.orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            createdAt: o.createdAt,
          }));
          setUserOrders(mapped);
          if (mapped.length > 0) {
            setSelectedOrderNumber(mapped[0].orderNumber);
          }
        }
      } catch {
        // Guest user or not logged in
      }
    }

    fetchWhatsAppConfig();
    fetchCustomerOrders();
  }, []);

  const activeOrderNum = selectedOrderNumber || customOrderInput.trim() || '[Order # or Registered Mobile]';
  const notesSnippet = customNotes.trim() ? `\nDetails: ${customNotes.trim()}` : '';
  const rawMessage = `Hello THALF Concierge, I am inquiring regarding a Refund under the Refund Policy.

Order Reference: ${activeOrderNum}
Request Type: ${requestType}${notesSnippet}

Please review my request and guide me on the refund status.`;

  const encodedMessage = encodeURIComponent(rawMessage);
  const targetPhone = whatsappConfig.phoneNumber.replace(/\D/g, '') || '919061107915';
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;

  const copyPageLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="bg-[#0B0604] text-[#FAF7F2] min-h-screen selection:bg-[#C5A059] selection:text-[#0B0604]" suppressHydrationWarning>
      
      {/* 1. Header Hero Banner */}
      <section className="bg-dark text-cream border-b border-gold/20 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(197,160,89,0.15),_transparent_60%)] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
          
          {/* Breadcrumb */}
          <div className="flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest text-taupe">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-cream">Refund &amp; Cancellation Policy</span>
          </div>

          {/* Refund Policy Badge */}
          <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gold border border-gold/40 px-4 py-1.5 bg-gold/10 backdrop-blur-sm">
            <CreditCard className="w-3.5 h-3.5 text-gold flex-shrink-0" />
            <span>Fair Dispute Resolution • Razorpay Direct Reversal</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-wider text-cream leading-tight">
            Refund &amp; Cancellation Policy
          </h1>

          <p className="text-xs sm:text-sm text-taupe font-light max-w-2xl mx-auto leading-relaxed">
            Our comprehensive guidelines on administrative refund approvals, payment gateway reversal timelines, cancellation windows, and atelier vouchers for THALF Artisanal Chocolates.
          </p>

          {/* Document Metadata Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-taupe font-mono">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-gold" />
              <span>Effective Date: October 2026</span>
            </span>
            <span className="hidden sm:inline text-gold/40">•</span>
            <span>Razorpay Payment Gateway Integration</span>
            <span className="hidden sm:inline text-gold/40">•</span>
            <button 
              onClick={copyPageLink}
              className="inline-flex items-center space-x-1 text-gold hover:text-gold-light transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Policy'}</span>
            </button>
          </div>

          {/* Cross-Link Card to Return Policy */}
          <div className="pt-4 max-w-md mx-auto">
            <Link 
              href="/return-policy" 
              className="inline-flex items-center space-x-2 text-xs text-gold hover:text-gold-light bg-gold/10 border border-gold/30 px-4 py-2 transition-all hover:bg-gold/20"
            >
              <PackageX className="w-3.5 h-3.5" />
              <span>Looking for food return &amp; damage rules? View Return Policy &rarr;</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Main Body Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">

        {/* Highlights Grid (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-1">
              <CreditCard className="w-4 h-4 text-emerald-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">1. Direct Source Reversal</h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              Approved refunds are credited directly back to your original payment method (UPI, Card, Net Banking) via Razorpay.
            </p>
          </div>

          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-1">
              <Clock className="w-4 h-4 text-amber-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">2. 24–48h Admin Review</h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              Refund claims submitted with media evidence are evaluated and processed by THALF administration within 1 to 2 business days.
            </p>
          </div>

          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mb-1">
              <FileCheck2 className="w-4 h-4 text-blue-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">3. 1-Hour Cancellation</h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              Cancel free of charge within 60 minutes of placing your order for an immediate 100% full refund before kitchen preparation begins.
            </p>
          </div>

          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-dark mb-1">
              <Sparkles className="w-4 h-4 text-gold-dark" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">4. Instant Store Credit Option</h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              Opt for an instant Atelier Gift Voucher code loaded with 100% of your claim value, valid for 12 months on all creations.
            </p>
          </div>
        </section>

        {/* Section 1: Refund Eligibility Criteria */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 1</span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Refund Eligibility Criteria
              </h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-1 border border-emerald-200 self-start sm:self-auto">
              Guaranteed Protection
            </span>
          </div>

          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed font-sans">
            A monetary refund is approved when an order claim is verified by THALF Admin under any of the following circumstances:
          </p>

          <div className="space-y-3 text-xs text-dark/80">
            <div className="p-4 bg-parchment/20 border border-parchment flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-dark">Severe Transit Melting:</strong>
                <p className="text-dark/70 pt-0.5">When extreme heatwaves or unexpected courier delays result in chocolate arriving liquified or compromised, and the customer prefers a refund over a replacement.</p>
              </div>
            </div>

            <div className="p-4 bg-parchment/20 border border-parchment flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-dark">Transit Crushed or Destroyed Package:</strong>
                <p className="text-dark/70 pt-0.5">When outer packaging is crushed and chocolate bars are broken into shards due to rough carrier freight handling.</p>
              </div>
            </div>

            <div className="p-4 bg-parchment/20 border border-parchment flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-dark">Fulfillment or Packaging Shortage:</strong>
                <p className="text-dark/70 pt-0.5">When an incorrect creation is dispatched, or designated gourmet items are missing from an ordered presentation hamper.</p>
              </div>
            </div>

            <div className="p-4 bg-parchment/20 border border-parchment flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-dark">Pre-Dispatch Order Cancellation:</strong>
                <p className="text-dark/70 pt-0.5">When an order is cancelled within the eligible 1-hour window before handcrafted kitchen allocation begins.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Payout Timelines by Payment Method */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 2</span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
                <Clock className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Refund Timelines by Payment Mode
              </h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2.5 py-1 border border-gold/30 self-start sm:self-auto">
              Razorpay Timelines
            </span>
          </div>

          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed font-sans">
            Once THALF Admin marks an order as refunded, our Razorpay gateway initiates the reversal immediately. The timeline for funds to reflect depends on your banking institution:
          </p>

          <div className="overflow-x-auto border border-parchment">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-dark text-cream font-serif font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3 border-b border-gold/30">Payment Method</th>
                  <th className="p-3 border-b border-gold/30">Reversal Destination</th>
                  <th className="p-3 border-b border-gold/30">Processing Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment bg-cream text-dark/80">
                <tr className="hover:bg-parchment/20 transition-colors">
                  <td className="p-3 font-semibold text-dark">UPI (GPay, PhonePe, Paytm, BHIM)</td>
                  <td className="p-3">Original Linked Bank Account / VPA</td>
                  <td className="p-3 font-mono text-gold-dark font-bold">24 – 48 business hours</td>
                </tr>
                <tr className="hover:bg-parchment/20 transition-colors">
                  <td className="p-3 font-semibold text-dark">Net Banking</td>
                  <td className="p-3">Original Bank Account</td>
                  <td className="p-3 font-mono text-gold-dark font-bold">3 – 5 business days</td>
                </tr>
                <tr className="hover:bg-parchment/20 transition-colors">
                  <td className="p-3 font-semibold text-dark">Credit Cards / Debit Cards (Visa, MC, RuPay)</td>
                  <td className="p-3">Issuing Card Account</td>
                  <td className="p-3 font-mono text-gold-dark font-bold">5 – 7 business days</td>
                </tr>
                <tr className="hover:bg-parchment/20 transition-colors">
                  <td className="p-3 font-semibold text-dark">THALF Atelier Store Credit Voucher</td>
                  <td className="p-3">Digital Voucher via WhatsApp / Email</td>
                  <td className="p-3 font-mono text-gold-dark font-bold">Instant (within 2 hours)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 p-4 flex items-start space-x-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Strict Source-Account Protocol (RBI Compliance):</p>
              <p className="text-amber-900/80 leading-relaxed">
                Under RBI regulations and anti-money laundering (AML) laws, electronic refunds are transmitted exclusively back to the original funding account. Cash payouts or transfers to alternative bank accounts are strictly prohibited.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Order Cancellation Policy */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-5">
          <div className="border-b border-parchment pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 3</span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
              <FileCheck2 className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Order Cancellation Policy
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-dark/80">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                Full 100% Refund
              </span>
              <h3 className="font-serif font-bold text-sm text-dark">Within 1 Hour of Placement</h3>
              <p className="text-dark/70 text-[11px] leading-relaxed">
                Orders can be cancelled free of charge if requested within 60 minutes of placing the order, provided our kitchen has not yet completed temperature-controlled sealing. A 100% full refund is issued automatically.
              </p>
            </div>

            <div className="p-4 bg-red-50/60 border border-red-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-800 bg-red-100 px-2 py-0.5 border border-red-300">
                Non-Cancellable
              </span>
              <h3 className="font-serif font-bold text-sm text-dark">Post-Dispatch / In Transit</h3>
              <p className="text-dark/70 text-[11px] leading-relaxed">
                Once an order has been handed over to our temperature-controlled courier partner (status: Dispatched), the shipment cannot be cancelled, recalled, or rerouted.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: WhatsApp Concierge Refund Assistant */}
        <section id="contact-concierge" className="bg-dark text-cream border-2 border-gold/40 p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(197,160,89,0.2),_transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2 text-gold text-[10px] font-bold uppercase tracking-widest">
              <CreditCard className="w-4 h-4" />
              <span>Direct Refund Desk</span>
            </div>

            <h2 className="font-serif font-black text-2xl sm:text-4xl uppercase text-cream leading-tight">
              Request a Refund or Cancellation
            </h2>

            <p className="text-xs sm:text-sm text-taupe font-light max-w-xl">
              Connect directly with our Concierge team on WhatsApp to check your refund status, report an unfulfilled order, or request order cancellation.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              <div className="lg:col-span-7 bg-cream/5 border border-gold/20 p-5 space-y-4">
                {userOrders.length > 0 ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gold mb-1.5">
                      Select Your Recent Order:
                    </label>
                    <select
                      value={selectedOrderNumber}
                      onChange={(e) => setSelectedOrderNumber(e.target.value)}
                      className="w-full px-3 py-2.5 bg-dark/95 border border-gold/40 text-cream text-xs font-mono focus:outline-none focus:border-gold"
                    >
                      {userOrders.map((ord) => (
                        <option key={ord.id} value={ord.orderNumber}>
                          #{ord.orderNumber} ({new Date(ord.createdAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gold mb-1.5">
                      Order Reference:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. THF-10492 or Phone Number"
                      value={customOrderInput}
                      onChange={(e) => setCustomOrderInput(e.target.value)}
                      className="w-full px-3 py-2.5 bg-dark/95 border border-gold/40 text-cream text-xs font-mono focus:outline-none focus:border-gold placeholder:text-taupe/50"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gold mb-1.5">
                    Request Category:
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-dark/95 border border-gold/40 text-cream text-xs font-sans focus:outline-none focus:border-gold"
                  >
                    <option value="Monetary Refund Request">Monetary Refund Request (Damaged / Melted)</option>
                    <option value="Order Cancellation (Pre-Dispatch)">Order Cancellation Request (Pre-Dispatch)</option>
                    <option value="Store Credit Voucher">Request Atelier Store Credit Voucher</option>
                    <option value="Failed Payment / Deducted Amount">Payment Deducted but Order Failed</option>
                    <option value="General Refund Query">General Refund Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gold mb-1.5">
                    Additional Notes (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cancel order placed 20 mins ago; or refund reference"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-dark/95 border border-gold/40 text-cream text-xs font-sans focus:outline-none focus:border-gold placeholder:text-taupe/50"
                  />
                </div>

                <div className="pt-1">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-taupe mb-1.5">
                    Live WhatsApp Message Preview:
                  </span>
                  <pre className="p-3 bg-dark/90 border border-gold/20 text-[10px] font-mono text-gold/90 whitespace-pre-wrap rounded-none max-h-36 overflow-y-auto">
                    {rawMessage}
                  </pre>
                </div>

                <div className="pt-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-gold text-dark hover:bg-gold-light text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xl space-x-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-dark" />
                    <span>Open WhatsApp Concierge (+91 90611 07915)</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 bg-dark/60 border border-gold/20 p-5 space-y-4 text-xs text-taupe">
                <h3 className="font-serif font-bold text-base text-cream flex items-center">
                  <Sparkles className="w-4 h-4 text-gold mr-2" /> Refund Processing SLA
                </h3>
                
                <ul className="space-y-2 text-[11px] leading-relaxed">
                  <li className="flex items-start space-x-2">
                    <Clock className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                    <span><strong>Operating Hours:</strong> Monday – Saturday, 9:00 AM – 7:00 PM IST</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                    <span><strong>Admin Review:</strong> 24 to 48 business hours</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                    <span><strong>UPI Payouts:</strong> 24 to 48h | <strong>Cards:</strong> 5 to 7 days</span>
                  </li>
                </ul>

                <div className="border-t border-gold/20 pt-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gold">Direct Channels:</p>
                  <p className="font-mono text-cream text-[11px]">WhatsApp: +91 90611 07915</p>
                  <p className="font-mono text-cream text-[11px]">Email: concierge@thalf.store</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Refund Policy FAQs */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 5</span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
              <HelpCircle className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Refund Policy FAQs
            </h2>
          </div>

          <div className="space-y-3">
            {REFUND_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="border border-parchment bg-cream transition-all hover:border-gold/50">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between space-x-3 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif font-bold text-sm sm:text-base text-dark">{faq.question}</span>
                    <span className="text-gold flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-dark/75 leading-relaxed font-sans border-t border-parchment/40 bg-parchment/10">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Navigation Link to Return Policy */}
        <div className="p-6 bg-parchment/20 border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base text-dark">Looking for Food Return &amp; Transit Rules?</h3>
            <p className="text-xs text-dark/70">Read our Strict No-Return Policy, food safety protocols, and transit exception rules on our dedicated Return Policy page.</p>
          </div>
          <Link
            href="/return-policy"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-dark text-cream hover:bg-gold hover:text-dark text-xs font-bold uppercase tracking-wider transition-all shadow-md flex-shrink-0"
          >
            <span>View Return Policy</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}
