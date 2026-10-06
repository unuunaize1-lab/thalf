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
  Truck, 
  Sparkles, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  FileCheck2,
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
  category: 'policy' | 'melting' | 'refund' | 'cancellation';
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: 'policy',
    question: 'Why does THALF maintain a strict No-Return and No-Exchange policy?',
    answer: 'THALF creations are delicate, temperature-sensitive, artisanal confectionery and perishable food products. Under strict Food Safety & Standards Authority of India (FSSAI) guidelines and international confectionery hygiene protocols, food products that leave our climate-controlled ateliers cannot be restocked or re-offered once delivered. For public health, hygiene, and product integrity, all sales are final upon delivery.'
  },
  {
    category: 'melting',
    question: 'What happens if my luxury chocolates arrive melted or deformed in transit?',
    answer: 'We pack every single order in custom insulated thermal presentation packaging with reusable cold-gel packs. However, during extreme summer heatwaves or unforeseen courier delays, rare temperature spikes can occur. If your chocolates arrive severely melted, compromised, or liquified, report it to our Concierge on WhatsApp within 48 hours with an unboxing video and clear photographs. Upon verification, we will immediately dispatch a complimentary express replacement batch or issue a full refund.'
  },
  {
    category: 'policy',
    question: 'Do I need to return or ship the damaged chocolates back to THALF?',
    answer: 'No! Under our Zero Return Shipping Guarantee, you will NEVER be asked to mail back spoiled, damaged, or melted food items. Reverse shipping of opened or perishable food products is unhygienic and unnecessary. Once our Concierge Desk verifies your unboxing video and photo proof, your replacement or refund is approved immediately, and you may safely dispose of the damaged items.'
  },
  {
    category: 'policy',
    question: 'Can I exchange a box if I do not like the taste, cocoa percentage, or flavor?',
    answer: 'No. Taste preferences, sweetness levels, and subjective flavor expectations (such as the intense astringency of an 85% single-origin dark chocolate bar) are individual and do not constitute a defect. Dispatched and delivered products cannot be returned or exchanged for subjective flavor preferences or change of mind.'
  },
  {
    category: 'cancellation',
    question: 'Can I cancel my order after paying on the website?',
    answer: 'Orders can only be cancelled within 1 hour of placement or before our kitchen begins temperature-controlled packing and batch allocation. Once an order is marked as "Dispatched" or handed over to our courier partners, cancellation is strictly not possible. If cancelled within the eligible window, a 100% full refund is issued automatically.'
  },
  {
    category: 'refund',
    question: 'How long will it take for my refund to appear in my bank account?',
    answer: 'Once approved by THALF Admin, refunds are processed immediately through our secure payment gateway (Razorpay) back to your original source payment method. UPI transfers reflect within 24 to 48 hours; Net Banking takes 3 to 5 business days; and Credit/Debit Cards take 5 to 7 business days depending on your issuing bank. Store credit vouchers are issued within 2 hours.'
  },
  {
    category: 'policy',
    question: 'What if I entered the wrong address or was not available to receive the package?',
    answer: 'Our courier partners attempt delivery up to 2-3 times with OTP and phone verification. Because chocolates are perishable and cannot survive prolonged exposure in courier holding facilities, failed deliveries due to incorrect addresses, wrong phone numbers, or customer unavailability are not eligible for a refund. Please ensure your shipping address and contact number are 100% accurate at checkout.'
  },
  {
    category: 'melting',
    question: 'How should I store my THALF chocolates once received?',
    answer: 'We recommend resting your sealed parcel at room temperature in a cool, air-conditioned room (18°C – 22°C / 64°F – 72°F) away from direct sunlight, moisture, and pungent odors for 1-2 hours before opening. If refrigerating in high-ambient summer regions, keep chocolates in their airtight moisture-barrier pouch and bring them to room temperature 15 minutes before savouring to enjoy the proper velvety cocoa melt.'
  }
];

export default function ReturnsRefundsClient() {
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppSettings>({
    phoneNumber: '919061107915',
    displayName: 'THALF Artisanal Concierge',
    enabled: true,
  });
  const [userOrders, setUserOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('');
  const [requestType, setRequestType] = useState<
    'Severe Transit Melt' | 'Damaged Packaging' | 'Incorrect Product Received' | 'Missing Item' | 'Order Cancellation (Pre-Dispatch)' | 'General Order Inquiry'
  >('Severe Transit Melt');
  const [customOrderInput, setCustomOrderInput] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeFaqFilter, setActiveFaqFilter] = useState<'all' | 'policy' | 'melting' | 'refund' | 'cancellation'>('all');

  useEffect(() => {
    // 1. Fetch dynamic WhatsApp business config
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
        // Fallback silently to default config
      }
    }

    // 2. Fetch authenticated customer's recent orders for safe prefilling
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
        // Guest user or not logged in; fallback to manual input
      }
    }

    fetchWhatsAppConfig();
    fetchCustomerOrders();
  }, []);

  // Generate safe WhatsApp prefilled deep link
  const activeOrderNum = selectedOrderNumber || customOrderInput.trim() || '[Order # or Registered Mobile]';
  const notesSnippet = customNotes.trim() ? `\nDetails: ${customNotes.trim()}` : '';
  const rawMessage = `Hello THALF Concierge, I need assistance regarding an order issue.

Order Reference: ${activeOrderNum}
Issue Category: ${requestType}${notesSnippet}

I have my unboxing video / photographs ready for review. Please guide me on next steps.`;

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

  const filteredFaqs = activeFaqFilter === 'all' 
    ? FAQ_ITEMS 
    : FAQ_ITEMS.filter(f => f.category === activeFaqFilter);

  return (
    <div className="bg-[#0B0604] text-[#FAF7F2] min-h-screen selection:bg-[#C5A059] selection:text-[#0B0604]" suppressHydrationWarning>
      
      {/* 1. Header Hero Banner */}
      <section className="bg-dark text-cream border-b border-gold/20 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Luxury Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(197,160,89,0.15),_transparent_60%)] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
          
          {/* Breadcrumb */}
          <div className="flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest text-taupe">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-cream">Refund & Return Policy</span>
          </div>

          {/* Strict No-Return Badge */}
          <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gold border border-gold/40 px-4 py-1.5 bg-gold/10 backdrop-blur-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-gold flex-shrink-0" />
            <span>Strict No-Return Policy • Food Safety Protocol</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-wider text-cream leading-tight">
            Refund &amp; Return Policy
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

          {/* Quick-Jump Navigation Tabs */}
          <div className="pt-6 flex flex-wrap justify-center gap-2 text-[10px] uppercase font-bold tracking-widest">
            <a href="#strict-no-return" className="px-3 py-1.5 bg-cream/5 border border-gold/30 text-gold hover:bg-gold hover:text-dark transition-all">
              1. No-Return Policy
            </a>
            <a href="#exceptions" className="px-3 py-1.5 bg-cream/5 border border-gold/30 text-gold hover:bg-gold hover:text-dark transition-all">
              2. Transit Exceptions
            </a>
            <a href="#zero-return-shipping" className="px-3 py-1.5 bg-cream/5 border border-gold/30 text-gold hover:bg-gold hover:text-dark transition-all">
              3. Zero Return Shipping
            </a>
            <a href="#claim-window" className="px-3 py-1.5 bg-cream/5 border border-gold/30 text-gold hover:bg-gold hover:text-dark transition-all">
              4. 48-Hour Claim
            </a>
            <a href="#refund-timelines" className="px-3 py-1.5 bg-cream/5 border border-gold/30 text-gold hover:bg-gold hover:text-dark transition-all">
              5. Refund Timelines
            </a>
            <a href="#contact-concierge" className="px-3 py-1.5 bg-gold text-dark font-black hover:bg-gold-light transition-all flex items-center space-x-1">
              <MessageCircle className="w-3 h-3 fill-dark" />
              <span>Concierge Claim Desk</span>
            </a>
          </div>

        </div>
      </section>

      {/* 2. Main Body Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">

        {/* Highlight Banner: Strict No-Return Alert */}
        <div className="bg-amber-500/10 border-2 border-amber-500/40 p-6 sm:p-7 space-y-3.5 shadow-lux relative overflow-hidden">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-amber-500/20 text-amber-700 flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-800" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-700 text-cream px-2 py-0.5">
                  Mandatory Notice
                </span>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-dark">
                  Strict No Return &amp; No Physical Exchange Policy
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-dark/85 leading-relaxed font-sans">
                Because THALF creations are delicate, temperature-sensitive, artisanal confectionery and perishable food products, <strong>no returns, physical exchanges, or handback collections are available once an order has been delivered</strong>. To protect the health, hygiene, and safety of all patrons, products that have left our atelier cold-chain custody cannot be restocked or returned.
              </p>
              <p className="text-xs text-dark/75 pt-1">
                <strong>Our Customer Guarantee:</strong> While physical returns are not accepted, we take 100% responsibility for genuine transit damage, severe melting, or fulfillment errors reported within 48 hours. In verified cases, we provide a <strong>free replacement batch or full monetary refund without requiring you to ship the product back</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Policy-at-a-Glance Grid (4 Luxury Pillars) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 mb-1">
              <Ban className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">
              1. Strict No Returns Available
            </h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              Perishable food items cannot be returned for change of mind, subjective taste preferences, or ordering mistakes. All sales are final upon delivery.
            </p>
          </div>

          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-dark mb-1">
              <ShieldCheck className="w-4 h-4 text-gold-dark" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">
              2. Zero Return Shipping
            </h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              In the rare event of transit damage or melting, you are never asked to mail perishable chocolates back. Verified claims are resolved directly.
            </p>
          </div>

          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-1">
              <Clock className="w-4 h-4 text-amber-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">
              3. Strict 48-Hour Claim Window
            </h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              All claims for transit damage, melting, or missing items must be logged within 48 hours of carrier delivery confirmation with unboxing video proof.
            </p>
          </div>

          <div className="bg-cream border border-parchment p-5 shadow-lux space-y-2.5 hover:border-gold/60 transition-all">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-1">
              <RefreshCw className="w-4 h-4 text-emerald-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-dark">
              4. Replacement or 100% Refund
            </h3>
            <p className="text-xs text-dark/75 leading-relaxed">
              Upon claim approval, receive an expedited fresh batch replacement or a 100% monetary refund credited directly to your original payment method in 5-7 days.
            </p>
          </div>

        </section>

        {/* Section 1: Detailed General Return Policy */}
        <section id="strict-no-return" className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 1</span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
                <PackageX className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> General Return &amp; Exchange Policy
              </h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-red-800 bg-red-100 px-2.5 py-1 border border-red-200 self-start sm:self-auto">
              Non-Returnable Category
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-dark/80 leading-relaxed font-sans">
            <p>
              THALF is an artisanal chocolate atelier where small-batch, handcrafted recipes are tempered, chilled, and boxed with utmost care. Because chocolate is a <strong>perishable food item governed by the Food Safety and Standards Authority of India (FSSAI)</strong>, once a parcel leaves our custody and is received by the consumer, its thermal exposure and sanitary conditions can no longer be verified.
            </p>
            <p className="font-medium text-dark">
              Consequently, <span className="underline decoration-gold underline-offset-4 font-bold">THALF does not accept physical returns or product exchanges under any standard circumstances</span>. All purchases are considered final once delivered.
            </p>
          </div>

          {/* Non-Eligible Scenarios Grid */}
          <div className="space-y-3 pt-2">
            <h3 className="font-serif font-bold text-sm sm:text-base text-dark flex items-center">
              <XCircle className="w-4 h-4 text-red-600 mr-2" />
              Scenarios Strictly Ineligible for Return or Refund:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-dark/80">
              <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
                <div className="flex items-center space-x-2 text-red-700 font-bold">
                  <span>✕</span>
                  <h4>Change of Mind</h4>
                </div>
                <p className="text-dark/70 text-[11px]">
                  Deciding you no longer require or desire the chocolates once an order has been dispatched or delivered.
                </p>
              </div>

              <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
                <div className="flex items-center space-x-2 text-red-700 font-bold">
                  <span>✕</span>
                  <h4>Subjective Taste &amp; Preference</h4>
                </div>
                <p className="text-dark/70 text-[11px]">
                  Subjective expectations regarding cocoa percentage, bitterness, sweetness level, botanical undertones, or mouthfeel.
                </p>
              </div>

              <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
                <div className="flex items-center space-x-2 text-red-700 font-bold">
                  <span>✕</span>
                  <h4>Customer Ordering Errors</h4>
                </div>
                <p className="text-dark/70 text-[11px]">
                  Inadvertently ordering the wrong flavor assortment, wrong hamper tier, or duplicate quantities during checkout.
                </p>
              </div>

              <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
                <div className="flex items-center space-x-2 text-red-700 font-bold">
                  <span>✕</span>
                  <h4>Doorstep Delivery Refusal</h4>
                </div>
                <p className="text-dark/70 text-[11px]">
                  Refusing to accept an on-time, scheduled delivery from the courier agent at your residential or office address.
                </p>
              </div>

              <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
                <div className="flex items-center space-x-2 text-red-700 font-bold">
                  <span>✕</span>
                  <h4>Incorrect Delivery Details</h4>
                </div>
                <p className="text-dark/70 text-[11px]">
                  Deliveries delayed, uncollected, or spoiled due to an erroneous pin code, invalid phone number, or locked premises.
                </p>
              </div>

              <div className="bg-parchment/30 p-3.5 border border-parchment/70 space-y-1">
                <div className="flex items-center space-x-2 text-red-700 font-bold">
                  <span>✕</span>
                  <h4>Improper Post-Delivery Storage</h4>
                </div>
                <p className="text-dark/70 text-[11px]">
                  Melting or spoilage occurring after successful delivery due to parcels kept in hot cars, sunny verandas, or uncooled areas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Exceptions - What Qualifies for Assistance */}
        <section id="exceptions" className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 2</span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Covered Exceptions &amp; Quality Guarantee
              </h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-1 border border-emerald-200 self-start sm:self-auto">
              100% Protection Guarantee
            </span>
          </div>

          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed font-sans">
            While returns are not accepted, our commitment to artisanal integrity means that <strong>you will never suffer a loss due to transit negligence or kitchen fulfillment errors</strong>. We provide swift resolution (express replacement or monetary refund) for the following verified occurrences:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="border border-parchment bg-parchment/10 p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold text-sm">
                <Flame className="w-4 h-4 text-gold flex-shrink-0" />
                <h3>Severe Transit Melting</h3>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed">
                Despite our thermal insulated liners and ice gel packs, prolonged courier delays in extreme summer regions can cause chocolate to melt or liquify. If your chocolates arrive compromised upon opening, it qualifies for immediate resolution.
              </p>
            </div>

            <div className="border border-parchment bg-parchment/10 p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold text-sm">
                <PackageX className="w-4 h-4 text-gold flex-shrink-0" />
                <h3>Transit Crushed or Broken Packaging</h3>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed">
                Outer presentation boxes crushed, perforated, or chocolate bars shattered into shards due to rough handling by freight handlers during transit.
              </p>
            </div>

            <div className="border border-parchment bg-parchment/10 p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold text-sm">
                <Sparkles className="w-4 h-4 text-gold flex-shrink-0" />
                <h3>Incorrect Creations Received</h3>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed">
                In the rare event that the creations delivered differ from the products or hamper collections listed on your official order confirmation email/invoice.
              </p>
            </div>

            <div className="border border-parchment bg-parchment/10 p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
                <h3>Missing Items or Hamper Shortages</h3>
              </div>
              <p className="text-xs text-dark/70 leading-relaxed">
                Missing units, incomplete gift sets, or missing designated gourmet accessories from an ordered multi-item presentation hamper.
              </p>
            </div>

          </div>
        </section>

        {/* Section 3: Zero Return Shipping Guarantee */}
        <section id="zero-return-shipping" className="bg-obsidian text-cream border border-gold/30 p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 border border-gold/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Customer Friction</span>
            </div>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-cream">
              Zero Return Shipping Guarantee: No Need to Send Food Back
            </h2>

            <p className="text-xs sm:text-sm text-taupe font-light leading-relaxed max-w-2xl">
              Unlike clothing or electronics retailers that require you to pack, tape, and ship items back via reverse courier logistics, <strong className="text-cream font-medium">THALF will NEVER ask you to post back melted or damaged food products</strong>.
            </p>

            <div className="bg-dark/80 border border-gold/20 p-4 sm:p-5 space-y-2 mt-4 text-xs text-taupe">
              <p className="text-cream font-medium">Why we do not require reverse shipping:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-1">
                <li>Reverse logistics for perishable chocolates is unhygienic, bio-wasteful, and environmentally irresponsible.</li>
                <li>Once your unboxing video and photo proof are verified by our Concierge Desk, your claim is approved on the spot.</li>
                <li>You may safely and responsibly discard or recycle the affected items without incurring return shipping fees or waiting for parcel returns.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Mandatory Claim Protocol & 48-Hour Reporting Window */}
        <section id="claim-window" className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 4</span>
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
              <p className="font-bold">Claims must be initiated within 48 hours of carrier delivery confirmation.</p>
              <p className="text-amber-900/80 leading-relaxed">
                Because chocolates are perishable, claims submitted after the 48-hour window from the courier delivery timestamp cannot be accepted, as post-delivery ambient storage factors cannot be ascertained.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-serif font-bold text-sm sm:text-base text-dark">
              Evidence Required When Submitting a Claim:
            </h3>
            <p className="text-xs text-dark/70">
              To prevent fraudulent claims and ensure rapid administrative sign-off, please provide the following 4 items to our WhatsApp Concierge:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-dark/80 pt-1">
              
              <div className="p-4 bg-parchment/30 border border-parchment/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-dark">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-dark flex items-center justify-center text-[10px]">1</span>
                  <h4>Uncut Unboxing Video</h4>
                </div>
                <p className="text-dark/70 text-[11px]">
                  A continuous video starting with the sealed outer carton, showing the shipping label, and unboxing the chocolates.
                </p>
              </div>

              <div className="p-4 bg-parchment/30 border border-parchment/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-dark">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-dark flex items-center justify-center text-[10px]">2</span>
                  <h4>Courier Label (AWB) Photo</h4>
                </div>
                <p className="text-dark/70 text-[11px]">
                  A clear photograph of the shipping label on the exterior carton with the Airway Bill (AWB) and recipient details visible.
                </p>
              </div>

              <div className="p-4 bg-parchment/30 border border-parchment/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-dark">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-dark flex items-center justify-center text-[10px]">3</span>
                  <h4>Damage / Melt Photos</h4>
                </div>
                <p className="text-dark/70 text-[11px]">
                  Well-lit, high-resolution photographs displaying the cracked box, melted bar, broken tamper seal, or wrong creation.
                </p>
              </div>

              <div className="p-4 bg-parchment/30 border border-parchment/80 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-dark">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-dark flex items-center justify-center text-[10px]">4</span>
                  <h4>Order Reference Number</h4>
                </div>
                <p className="text-dark/70 text-[11px]">
                  Your THALF Order Number (e.g., #THF-10294) and registered mobile number used during online checkout.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Section 5: Refund Policy & Timelines */}
        <section id="refund-timelines" className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 5</span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
                <CreditCard className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Refund Policy, Payout Modes &amp; Timelines
              </h2>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2.5 py-1 border border-gold/30 self-start sm:self-auto">
              Razorpay Direct Reversal
            </span>
          </div>

          <p className="text-xs sm:text-sm text-dark/80 leading-relaxed font-sans">
            When an exception claim is formally approved by THALF Admin, the patron may choose between an <strong>immediate complimentary express replacement</strong> (recommended for gourmet gifting) or a <strong>monetary refund</strong>.
          </p>

          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm sm:text-base text-dark">
              Expected Refund Timelines by Payment Instrument:
            </h3>

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

            <p className="text-[11px] text-dark/65 italic leading-relaxed pt-1">
              <strong>Source Account Protocol:</strong> Under RBI and anti-money-laundering (AML) payment guidelines, all electronic refunds are transmitted exclusively back to the original funding account. Cash payouts or transfers to alternate third-party accounts are strictly prohibited.
            </p>
          </div>
        </section>

        {/* Section 6: Order Cancellation Policy */}
        <section id="cancellations" className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-5">
          <div className="border-b border-parchment pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 6</span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
              <FileCheck2 className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Order Cancellation Policy
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-dark/80">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                Eligible Cancellation
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
                Once an order has been handed over to our temperature-controlled courier partner (status: Dispatched), the shipment cannot be cancelled, recalled, or diverted.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7: Dedicated WhatsApp Concierge Claim Assistant Card */}
        <section id="contact-concierge" className="bg-dark text-cream border-2 border-gold/40 p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(197,160,89,0.2),_transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            
            <div className="flex items-center space-x-2 text-gold text-[10px] font-bold uppercase tracking-widest">
              <MessageCircle className="w-4 h-4" />
              <span>Direct Concierge Handoff &amp; Claim Desk</span>
            </div>

            <h2 className="font-serif font-black text-2xl sm:text-4xl uppercase text-cream leading-tight">
              Need Help With Your Order?
            </h2>

            <p className="text-xs sm:text-sm text-taupe font-light max-w-xl">
              Connect directly with our Master Concierge on WhatsApp to report transit issues, melting, or request administrative claim evaluation.
            </p>

            {/* Interactive Order Selector & Prefill Form */}
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
                      Order Reference (Optional):
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
                    <option value="Order Cancellation (Pre-Dispatch)">Order Cancellation Request (Pre-Dispatch)</option>
                    <option value="General Order Inquiry">General Order Inquiry</option>
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

                {/* Live Message Preview */}
                <div className="pt-1">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-taupe mb-1.5">
                    Live WhatsApp Message Preview:
                  </span>
                  <pre className="p-3 bg-dark/90 border border-gold/20 text-[10px] font-mono text-gold/90 whitespace-pre-wrap rounded-none max-h-36 overflow-y-auto">
                    {rawMessage}
                  </pre>
                </div>

                {/* Launch Button */}
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

              {/* Concierge Guidelines Side Card */}
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
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gold">Direct Contact Channels:</p>
                  <p className="font-mono text-cream text-[11px]">WhatsApp: +91 90611 07915</p>
                  <p className="font-mono text-cream text-[11px]">Email: concierge@thalf.store</p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Section 8: Interactive FAQ Accordion */}
        <section id="faqs" className="bg-cream border border-parchment p-6 sm:p-8 shadow-lux space-y-6">
          <div className="border-b border-parchment pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Section 8</span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-dark flex items-center mt-0.5">
                <HelpCircle className="w-5 h-5 text-gold mr-3 flex-shrink-0" /> Frequently Asked Questions
              </h2>
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-[9px] uppercase font-bold tracking-wider">
              {(['all', 'policy', 'melting', 'refund', 'cancellation'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFaqFilter(filter)}
                  className={`px-2.5 py-1 border transition-all ${
                    activeFaqFilter === filter
                      ? 'bg-dark text-cream border-dark'
                      : 'bg-parchment/30 text-dark/70 border-parchment hover:border-gold'
                  }`}
                >
                  {filter === 'all' ? 'All Questions' : filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className="border border-parchment bg-cream transition-all hover:border-gold/50"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between space-x-3 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif font-bold text-sm sm:text-base text-dark">
                      {faq.question}
                    </span>
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

        {/* Section 9: Legal Disclaimers & Fair Dispute Resolution */}
        <section className="bg-cream border border-parchment p-6 shadow-lux space-y-3 text-[11px] text-dark/70 leading-relaxed">
          <h3 className="font-serif font-bold text-sm text-dark uppercase tracking-wider">
            Legal Compliance &amp; Consumer Protection Statement
          </h3>
          <p>
            This Refund &amp; Return Policy is framed in strict alignment with the <em>Consumer Protection (E-Commerce) Rules, 2020</em> and guidelines issued by the <em>Food Safety and Standards Authority of India (FSSAI)</em> regarding perishable confectionery products.
          </p>
          <p>
            THALF reserves the right to decline claims where unboxing video evidence is absent, where damage is identified as post-delivery mishandling or improper temperature storage by the recipient, or where requests are submitted after the stipulated 48-hour reporting period.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-dark font-medium border-t border-parchment text-[11px]">
            <span>Atelier Inquiries: <a href="mailto:concierge@thalf.store" className="text-gold underline">concierge@thalf.store</a></span>
            <span>Customer Care: <a href="https://wa.me/919061107915" className="text-gold underline">+91 90611 07915</a></span>
          </div>
        </section>

      </main>
    </div>
  );
}
