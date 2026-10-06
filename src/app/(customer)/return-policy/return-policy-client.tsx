'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  MessageCircle, 
  Clock, 
  PackageX, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown,
  ChevronUp,
  CreditCard, 
  Ban, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  XCircle,
  Copy,
  Check,
  RefreshCw
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

const RETURN_FAQS: FAQItem[] = [
  {
    question: 'Why does THALF maintain a strict No-Return and No-Exchange policy?',
    answer: 'THALF creations are delicate, temperature-sensitive, artisanal confectionery and perishable food products. Under Food Safety & Standards Authority of India (FSSAI) guidelines and confectionery hygiene protocols, food products that leave our climate-controlled ateliers cannot be restocked or re-offered once delivered. For public health, hygiene, and product integrity, all sales are final upon delivery.'
  },
  {
    question: 'What happens if my chocolates arrive melted or deformed in transit?',
    answer: 'We pack every order in custom insulated thermal packaging with reusable cold-gel packs. However, during extreme summer heatwaves or unforeseen courier delays, rare temperature spikes can occur. If your chocolates arrive severely melted or compromised, report it to our Concierge on WhatsApp within 48 hours with an unboxing video and clear photographs. Upon verification, we immediately dispatch a complimentary express replacement batch or issue a full refund.'
  },
  {
    question: 'Do I need to return or ship the damaged chocolates back to THALF?',
    answer: 'No! Under our Zero Return Shipping Guarantee, you will NEVER be asked to mail back spoiled, damaged, or melted food items. Reverse shipping of opened or perishable food products is unhygienic and unnecessary. Once our Concierge Desk verifies your unboxing video and photo proof, your replacement is approved immediately, and you may safely dispose of the damaged items.'
  },
  {
    question: 'Can I exchange a box if I made a mistake or want a different flavor?',
    answer: 'No. Because all chocolate items are perishable and sealed under strict culinary hygiene conditions, we cannot accept product exchanges for flavor preferences, cocoa percentage choices, or accidental duplicate orders once dispatched.'
  },
  {
    question: 'What if the courier could not reach me or attempted delivery when I was away?',
    answer: 'Our courier partners attempt delivery up to 2-3 times with phone and OTP coordination. Because chocolates are perishable and cannot survive prolonged exposure in courier holding depots, deliveries that fail due to incorrect addresses or repeated customer unavailability cannot be returned or refunded.'
  },
  {
    question: 'How should I store my THALF chocolates upon delivery?',
    answer: 'We recommend resting your sealed parcel at room temperature in a cool, air-conditioned room (18°C – 22°C / 64°F – 72°F) away from direct sunlight for 1-2 hours before opening. If refrigerating during peak summer, keep chocolates in their airtight pouch and allow them to rest at room temperature for 15 minutes before savouring.'
  }
];

export default function ReturnPolicyClient() {
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppSettings>({
    phoneNumber: '919061107915',
    displayName: 'THALF Artisanal Concierge',
    enabled: true,
  });
  const [userOrders, setUserOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('');
  const [requestType, setRequestType] = useState<
    'Severe Transit Melt' | 'Damaged Packaging' | 'Incorrect Product Received' | 'Missing Item' | 'General Return Inquiry'
  >('Severe Transit Melt');
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
  const rawMessage = `Hello THALF Concierge, I am reporting a delivery issue under the Return Policy.

Order Reference: ${activeOrderNum}
Issue Category: ${requestType}${notesSnippet}

I have my unboxing video and photographs ready for review. Please guide me.`;

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
            <span className="text-cream">Return &amp; Exchange Policy</span>
          </div>

          {/* Strict No-Return Badge */}
          <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gold border border-gold/40 px-4 py-1.5 bg-gold/10 backdrop-blur-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-gold flex-shrink-0" />
            <span>Strict No-Return Policy • Food Safety Standards</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-wider text-cream leading-tight">
            Return &amp; Exchange Policy
          </h1>

          <p className="text-xs sm:text-sm text-taupe font-light max-w-2xl mx-auto leading-relaxed">
            Perishable Artisanal Chocolates &amp; Confectionery. To guarantee strict hygiene standards and cold-chain integrity, <strong className="text-cream font-medium">all sales are final once delivered</strong>. Returns and physical exchanges are strictly not accepted.
          </p>

          {/* Document Metadata Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-taupe font-mono">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-gold" />
              <span>Effective Date: October 2026</span>
            </span>
            <span className="hidden sm:inline text-gold/40">•</span>
            <span>FSSAI Confectionery Standards Compliant</span>
            <span className="hidden sm:inline text-gold/40">•</span>
            <button 
              onClick={copyPageLink}
              className="inline-flex items-center space-x-1 text-gold hover:text-gold-light transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Policy'}</span>
            </button>
          </div>

          {/* Cross-Link Card to Refund Policy */}
          <div className="pt-4 max-w-md mx-auto">
            <Link 
              href="/refund-policy" 
              className="inline-flex items-center space-x-2 text-xs text-gold hover:text-gold-light bg-gold/10 border border-gold/30 px-4 py-2 transition-all hover:bg-gold/20"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Looking for refund timelines &amp; payout terms? View Refund Policy &rarr;</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Main Body Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">

        {/* Mandatory Notice Banner */}
        <div className="bg-amber-500/10 border-2 border-amber-500/40 p-6 sm:p-7 space-y-3.5 shadow-lux relative overflow-hidden">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-amber-500/20 text-amber-700 flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-800" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-700 text-cream px-2 py-0.5">
                  Food Safety Notice
                </span>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-dark">
                  Strict No Return &amp; No Physical Exchange Policy
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-dark/85 leading-relaxed font-sans">
                Because THALF creations are delicate, temperature-sensitive, artisanal confectionery and perishable food products, <strong>no returns, physical exchanges, or pickup collections are available once an order has been delivered</strong>. To protect the health, hygiene, and safety of all patrons, products that have left our atelier cold-chain custody cannot be restocked or returned.
              </p>
              <p className="text-xs text-dark/75 pt-1">
                <strong>Our Customer Guarantee:</strong> While physical returns are strictly barred, we take 100% responsibility for transit damage, severe melting, or fulfillment errors reported within 48 hours. In verified cases, we dispatch a <strong>free replacement batch without requiring you to ship the product back</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Pillars (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 mb-1">
              <Ban className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">1. Zero Returns Accepted</h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              Perishable food items cannot be returned for change of mind, subjective taste preferences, or ordering mistakes. All sales are final upon delivery.
            </p>
          </div>

          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-dark mb-1">
              <ShieldCheck className="w-4 h-4 text-gold-dark" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">2. Zero Return Shipping</h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              In the rare event of transit damage or melting, you are never asked to mail perishable chocolates back. Verified claims receive direct resolution.
            </p>
          </div>

          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-1">
              <Clock className="w-4 h-4 text-amber-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">3. Strict 48-Hour Claim Window</h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              All claims for transit damage, melting, or missing items must be logged within 48 hours of carrier delivery confirmation with unboxing video proof.
            </p>
          </div>

          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-1">
              <RefreshCw className="w-4 h-4 text-emerald-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">4. Free Fresh Replacement</h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              Upon claim approval, receive an expedited fresh batch replacement dispatched at zero additional charge, or opt for store credit/refund.
            </p>
          </div>
        </section>

        {/* Section 1: Ineligible Scenarios */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 1</span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
                <PackageX className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Ineligible Scenarios for Return
              </h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-red-800 bg-red-100 px-2.5 py-1 border border-red-200 self-start sm:self-auto">
              Non-Returnable Category
            </span>
          </div>

          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed font-sans">
            Under FSSAI hygiene regulations, edible products cannot be reintroduced into an artisanal kitchen or redistributed. The following circumstances are strictly non-returnable:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-dark/80">
            <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
              <div className="flex items-center space-x-2 text-red-700 font-bold">
                <span>✕</span>
                <h4>Change of Mind</h4>
              </div>
              <p className="text-dark/70 text-[11px]">Deciding you no longer require the chocolates once an order has been dispatched or delivered.</p>
            </div>

            <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
              <div className="flex items-center space-x-2 text-red-700 font-bold">
                <span>✕</span>
                <h4>Subjective Taste &amp; Preference</h4>
              </div>
              <p className="text-dark/70 text-[11px]">Subjective expectations regarding cocoa percentage, bitterness, sweetness level, or texture.</p>
            </div>

            <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
              <div className="flex items-center space-x-2 text-red-700 font-bold">
                <span>✕</span>
                <h4>Customer Ordering Mistakes</h4>
              </div>
              <p className="text-dark/70 text-[11px]">Accidentally selecting the wrong flavor, wrong box size, or duplicate quantities during checkout.</p>
            </div>

            <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
              <div className="flex items-center space-x-2 text-red-700 font-bold">
                <span>✕</span>
                <h4>Doorstep Delivery Refusal</h4>
              </div>
              <p className="text-dark/70 text-[11px]">Refusing to accept a scheduled, undamaged delivery from the courier agent upon arrival.</p>
            </div>

            <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
              <div className="flex items-center space-x-2 text-red-700 font-bold">
                <span>✕</span>
                <h4>Incorrect Delivery Details</h4>
              </div>
              <p className="text-dark/70 text-[11px]">Shipments delayed or spoiled due to an incorrect pin code, invalid phone number, or locked premises.</p>
            </div>

            <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
              <div className="flex items-center space-x-2 text-red-700 font-bold">
                <span>✕</span>
                <h4>Improper Post-Delivery Storage</h4>
              </div>
              <p className="text-dark/70 text-[11px]">Melting or bloom occurring after successful delivery due to parcels kept in hot cars or direct sunlight.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Transit Exceptions */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 2</span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Covered Transit Exceptions
              </h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-1 border border-emerald-200 self-start sm:self-auto">
              100% Transit Guarantee
            </span>
          </div>

          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed font-sans">
            While returns are not accepted, our commitment to artisanal excellence means you will never suffer a loss due to transit negligence. We provide swift resolution for:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-parchment bg-parchment/10 p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold text-sm">
                <Flame className="w-4 h-4 text-gold flex-shrink-0" />
                <h3>Severe Transit Melting</h3>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed">
                If extraordinary courier delays in extreme heat cause chocolate to arrive melted or liquified upon opening, it qualifies for immediate replacement.
              </p>
            </div>

            <div className="border border-parchment bg-parchment/10 p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold text-sm">
                <PackageX className="w-4 h-4 text-gold flex-shrink-0" />
                <h3>Crushed or Broken Packaging</h3>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed">
                Boxes crushed, punctured, or chocolate slabs shattered into pieces due to rough handling by freight handlers during transit.
              </p>
            </div>

            <div className="border border-parchment bg-parchment/10 p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold text-sm">
                <Sparkles className="w-4 h-4 text-gold flex-shrink-0" />
                <h3>Incorrect Creations Received</h3>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed">
                If items received differ from the creations listed on your official order confirmation email or invoice.
              </p>
            </div>

            <div className="border border-parchment bg-parchment/10 p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
                <h3>Missing Items in Hamper</h3>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed">
                Missing units or accessories from an ordered multi-item presentation hamper or gift box.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Zero Return Shipping */}
        <section className="bg-obsidian text-cream border border-gold/30 p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 border border-gold/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Friction Guarantee</span>
            </div>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-cream">
              Zero Return Shipping: You Never Send Food Back
            </h2>

            <p className="text-xs sm:text-sm text-taupe font-light leading-relaxed max-w-2xl">
              Unlike apparel stores that mandate you repackage and return items via reverse logistics, <strong className="text-cream font-medium">THALF will NEVER ask you to post back melted or damaged food products</strong>. Reverse shipping of opened chocolates is unhygienic and wasteful.
            </p>

            <div className="bg-dark/80 border border-gold/20 p-4 sm:p-5 space-y-2 mt-4 text-xs text-taupe">
              <p className="text-cream font-medium">What happens instead:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-1">
                <li>Submit your unboxing video and photo proof to our WhatsApp Concierge.</li>
                <li>Once verified, your replacement or credit is approved on the spot.</li>
                <li>You may safely dispose of the compromised product. No reverse courier waiting or return shipping fees.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: 48-Hour Reporting Protocol */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 3</span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
                <Clock className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Mandatory 48-Hour Claim Protocol
              </h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-900 bg-amber-100 px-2.5 py-1 border border-amber-300 self-start sm:self-auto">
              Strict 48-Hour Window
            </span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 p-4 flex items-start space-x-3 text-xs text-amber-900">
            <Clock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Claims must be reported within 48 hours of carrier delivery confirmation.</p>
              <p className="text-amber-900/80 leading-relaxed">
                Because chocolates are perishable, claims submitted after 48 hours from the courier delivery timestamp cannot be accepted, as post-delivery storage factors cannot be verified.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-serif font-bold text-sm sm:text-base text-dark">
              Checklist Required When Reporting an Issue:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-dark/80 pt-1">
              <div className="p-4 bg-parchment/30 border border-parchment/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-dark">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-dark flex items-center justify-center text-[10px]">1</span>
                  <h4>Uncut Unboxing Video</h4>
                </div>
                <p className="text-dark/70 text-[11px]">A continuous video showing the sealed parcel, shipping label, and the opening of the package.</p>
              </div>

              <div className="p-4 bg-parchment/30 border border-parchment/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-dark">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-dark flex items-center justify-center text-[10px]">2</span>
                  <h4>Courier Label (AWB) Photo</h4>
                </div>
                <p className="text-dark/70 text-[11px]">A clear photo of the shipping label on the exterior carton with the tracking number visible.</p>
              </div>

              <div className="p-4 bg-parchment/30 border border-parchment/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-dark">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-dark flex items-center justify-center text-[10px]">3</span>
                  <h4>Damage / Melt Photos</h4>
                </div>
                <p className="text-dark/70 text-[11px]">High-resolution photographs displaying the cracked box, melted bar, or wrong creation.</p>
              </div>

              <div className="p-4 bg-parchment/30 border border-parchment/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-dark">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-dark flex items-center justify-center text-[10px]">4</span>
                  <h4>Order Reference Number</h4>
                </div>
                <p className="text-dark/70 text-[11px]">Your THALF Order Number (e.g. #THF-10294) and registered mobile number.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: WhatsApp Concierge Claim Assistant */}
        <section id="contact-concierge" className="bg-dark text-cream border-2 border-gold/40 p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(197,160,89,0.2),_transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2 text-gold text-[10px] font-bold uppercase tracking-widest">
              <MessageCircle className="w-4 h-4" />
              <span>Direct Concierge Handoff</span>
            </div>

            <h2 className="font-serif font-black text-2xl sm:text-4xl uppercase text-cream leading-tight">
              Report a Delivery Issue
            </h2>

            <p className="text-xs sm:text-sm text-taupe font-light max-w-xl">
              Connect directly with our Master Concierge on WhatsApp to report transit issues, melting, or request replacement evaluation.
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
                    Issue Category:
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-dark/95 border border-gold/40 text-cream text-xs font-sans focus:outline-none focus:border-gold"
                  >
                    <option value="Severe Transit Melt">Severe Transit Melt (Heat Exposure)</option>
                    <option value="Damaged Packaging">Damaged / Crushed Box in Transit</option>
                    <option value="Incorrect Product Received">Incorrect Product / Creation Received</option>
                    <option value="Missing Item">Missing Item in Presentation Hamper</option>
                    <option value="General Return Inquiry">General Return Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gold mb-1.5">
                    Additional Notes (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 bars melted on left side; parcel received today"
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
                  <Sparkles className="w-4 h-4 text-gold mr-2" /> Concierge Desk Hours
                </h3>
                
                <ul className="space-y-2 text-[11px] leading-relaxed">
                  <li className="flex items-start space-x-2">
                    <Clock className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                    <span><strong>Operating Hours:</strong> Monday – Saturday, 9:00 AM – 7:00 PM IST</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                    <span><strong>Evaluation Turnaround:</strong> Claims assessed within 24 to 48 business hours</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                    <span><strong>Checklist:</strong> Keep your unboxing video &amp; outer carton label handy</span>
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

        {/* Section 6: Return Policy FAQs */}
        <section className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 5</span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
              <HelpCircle className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Return Policy FAQs
            </h2>
          </div>

          <div className="space-y-3">
            {RETURN_FAQS.map((faq, index) => {
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

        {/* Bottom Navigation Link to Refund Policy */}
        <div className="p-6 bg-parchment/20 border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base text-dark">Need Information About Refunds &amp; Cancellations?</h3>
            <p className="text-xs text-dark/70">Read our payout timelines, Razorpay reversals, and cancellation eligibility on our dedicated Refund Policy page.</p>
          </div>
          <Link
            href="/refund-policy"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-dark text-cream hover:bg-gold hover:text-dark text-xs font-bold uppercase tracking-wider transition-all shadow-md flex-shrink-0"
          >
            <span>View Refund Policy</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}
