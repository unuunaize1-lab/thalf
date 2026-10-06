'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  ThermometerSnowflake, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  PackageCheck, 
  AlertTriangle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  MessageCircle,
  Copy,
  Check,
  Search,
  ExternalLink
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const SHIPPING_FAQS: FAQItem[] = [
  {
    question: 'Why does THALF only dispatch orders Monday through Thursday?',
    answer: 'Artisanal chocolate is extremely sensitive to ambient temperature fluctuations. Dispatching on Monday through Thursday guarantees that parcels travel continuously through express courier networks rather than sitting stranded inside non-climate-controlled courier sorting hubs over Saturday and Sunday. This strict protocol preserves the crisp snap and smooth temper of every chocolate bar.'
  },
  {
    question: 'What is THALF’s Cold-Chain Packaging standard?',
    answer: 'Every order is packed inside an airtight food-grade barrier, surrounded by reusable cold-gel ice packs and enclosed within a specialized multi-layer metallized thermal reflective bubble pouch. This creates an insulated microclimate capable of sustaining safe temperatures for up to 72 hours across diverse Indian climates.'
  },
  {
    question: 'How much is shipping, and how long does delivery take?',
    answer: 'Shipping is charged at a flat rate of ₹80 within Kerala (typically 1–3 business days after dispatch) and ₹100 across the Rest of India (typically 3–5 business days). Small-batch fresh handcrafting takes 24 to 48 hours prior to dispatch.'
  },
  {
    question: 'How do I track my order once it has been dispatched?',
    answer: 'The moment your parcel is collected by our express logistics partner (Delhivery, Blue Dart, DTDC, or India Post), an Air Waybill (AWB) number and live tracking link will be sent to your registered phone number via WhatsApp and SMS. You can also view live delivery status anytime on your Account Dashboard.'
  },
  {
    question: 'What should I do as soon as my chocolate parcel arrives?',
    answer: 'If the weather in your area is warm, DO NOT immediately open or refrigerate the parcel. Keep the sealed box in a cool, air-conditioned room (18°C – 22°C / 64°F – 72°F) away from direct sunlight for 1 to 2 hours. This prevents thermal shock, moisture condensation, and sugar bloom, allowing the cocoa butter crystallization to stabilize perfectly.'
  },
  {
    question: 'Can I change my delivery address after placing an order?',
    answer: 'You may update your shipping address within 1 hour of order confirmation by contacting our WhatsApp Concierge Desk (+91 90611 07915). Once your parcel has been handed over to the courier and an AWB tracking code has been issued, addresses cannot be rerouted in transit.'
  },
  {
    question: 'What happens if I miss the courier delivery attempts?',
    answer: 'Our courier partners attempt delivery up to 2 to 3 times with telephonic or OTP coordination. Because our chocolates are perishable and cannot survive prolonged exposure in logistics depots, orders returned to origin due to repeated customer unavailability or incorrect address entries are not eligible for free reshipment or refunds.'
  }
];

export default function ShippingPolicyClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedZone, setSelectedZone] = useState<'kerala' | 'national'>('kerala');
  const [pinInput, setPinInput] = useState('');
  const [pinEstimate, setPinEstimate] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePinCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (cleanPin.length !== 6 || !/^\d+$/.test(cleanPin)) {
      setPinEstimate('Please enter a valid 6-digit Indian postal PIN code.');
      return;
    }

    const firstTwo = parseInt(cleanPin.substring(0, 2), 10);
    // PIN codes starting with 67, 68, 69 belong to Kerala / Lakshadweep
    if (firstTwo >= 67 && firstTwo <= 69) {
      setPinEstimate('Kerala Delivery Zone: Flat ₹80 shipping • Estimated transit: 1–3 business days via Express Courier with thermal cold-pack protection.');
      setSelectedZone('kerala');
    } else {
      setPinEstimate('National Delivery Zone: Flat ₹100 shipping • Estimated transit: 3–5 business days via Air Cargo Express with thermal cold-pack protection.');
      setSelectedZone('national');
    }
  };

  const copyPolicyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="bg-[#0B0604] text-[#FAF7F2] min-h-screen selection:bg-[#C5A059] selection:text-[#0B0604]" suppressHydrationWarning>
      
      {/* 1. EDITORIAL HEADER & HERO */}
      <section className="relative pt-24 pb-16 border-b border-[#C5A059]/20 overflow-hidden bg-gradient-to-b from-[#140C08] via-[#0E0805] to-[#0B0604]">
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#C5A059]/30 blur-[120px]" />
          <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-[#5A3D24]/40 blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10 space-y-6">
          {/* Breadcrumb & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono uppercase tracking-widest text-[#C5A059]/90">
            <div className="flex items-center space-x-2">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#FAF7F2]">Shipping & Delivery</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#C5A059]/10 border border-[#C5A059]/30 px-3 py-1 text-[11px]">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Cold-Chain Insulated Shipping</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A059] block">
              Logistics & Cold-Chain Protocol
            </span>
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-light text-cream leading-[1.05] tracking-tight">
              Shipping <span className="poetic-italic font-normal text-[#C5A059]">&</span> Cold-Chain Delivery.
            </h1>
            <p className="text-sm sm:text-base text-taupe font-light leading-relaxed">
              Every THALF creation is handcrafted in small artisanal batches in Kerala and dispatched in specialized thermal-insulated cold-chain packaging designed to withstand the Indian climate.
            </p>
          </div>

          {/* Meta bar & Quick Links */}
          <div className="pt-4 border-t border-[#C5A059]/15 flex flex-wrap items-center justify-between gap-4 text-xs text-taupe font-mono">
            <div className="flex items-center space-x-4">
              <span>Updated: October 2026</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pan-India Delivery Active</span>
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={copyPolicyLink}
                suppressHydrationWarning
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-[#C5A059]/30 hover:border-[#C5A059] text-[#FAF7F2] hover:text-[#C5A059] transition-colors text-[11px]"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Link Copied' : 'Share Policy'}</span>
              </button>

              <a
                href="https://wa.me/919061107915?text=Hello%20THALF,%20I%20have%20a%20question%20regarding%20shipping%20and%20delivery."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#C5A059] text-[#0B0604] hover:bg-[#D4AF37] font-semibold transition-colors text-[11px]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Shipping Concierge</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUR PILLARS OF THALF DELIVERY */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 bg-[#160E0A] border border-[#C5A059]/25 flex flex-col justify-between space-y-4 shadow-lg group hover:border-[#C5A059] transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                <ThermometerSnowflake className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-xl text-cream font-medium">Thermal Cold Pack</h3>
              <p className="text-xs text-taupe leading-relaxed">
                Multi-layer metallic thermal pouches paired with reusable cold-gel packs that maintain 18°C–22°C interior temperatures for up to 72 hours.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase text-[#C5A059] tracking-wider block pt-2 border-t border-[#C5A059]/15">
              100% Melt Protection
            </span>
          </div>

          <div className="p-6 bg-[#160E0A] border border-[#C5A059]/25 flex flex-col justify-between space-y-4 shadow-lg group hover:border-[#C5A059] transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-xl text-cream font-medium">Mon–Thu Dispatch</h3>
              <p className="text-xs text-taupe leading-relaxed">
                We strictly dispatch Monday to Thursday so chocolates travel continuously and never sit stranded in courier transit hubs over weekend closures.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase text-[#C5A059] tracking-wider block pt-2 border-t border-[#C5A059]/15">
              Zero Weekend Holdover
            </span>
          </div>

          <div className="p-6 bg-[#160E0A] border border-[#C5A059]/25 flex flex-col justify-between space-y-4 shadow-lg group hover:border-[#C5A059] transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-xl text-cream font-medium">Flat Express Rates</h3>
              <p className="text-xs text-taupe leading-relaxed">
                Transparent flat pricing with no hidden weight surges: ₹80 flat across all of Kerala, and ₹100 flat across the Rest of India.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase text-[#C5A059] tracking-wider block pt-2 border-t border-[#C5A059]/15">
              Kerala: ₹80 | India: ₹100
            </span>
          </div>

          <div className="p-6 bg-[#160E0A] border border-[#C5A059]/25 flex flex-col justify-between space-y-4 shadow-lg group hover:border-[#C5A059] transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                <PackageCheck className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-xl text-cream font-medium">WhatsApp Tracking</h3>
              <p className="text-xs text-taupe leading-relaxed">
                Automated live tracking link and AWB tracking sent straight to your WhatsApp & SMS the minute courier pickup scans occur.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase text-[#C5A059] tracking-wider block pt-2 border-t border-[#C5A059]/15">
              Live AWB Updates
            </span>
          </div>

        </div>
      </section>

      {/* 3. RATES & ESTIMATED DELIVERY TIMELINES TABLE */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15 space-y-8">
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C5A059]">Delivery Rates & Timelines</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-light text-cream">Transparent Flat Shipping Across India</h2>
          <p className="text-xs sm:text-sm text-taupe font-light max-w-2xl">
            Because THALF treats chocolate delivery with the urgency of a fresh culinary item, we partner with premier express logistics carriers (Delhivery, Blue Dart, DTDC, and India Post Speed Post).
          </p>
        </div>

        <div className="overflow-x-auto border border-[#C5A059]/30 bg-[#140C08]">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#1C120B] border-b border-[#C5A059]/30 text-[#C5A059] font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-5 sm:px-6">Destination Region</th>
                <th className="py-4 px-4 sm:px-6">Flat Rate</th>
                <th className="py-4 px-4 sm:px-6">Transit Time</th>
                <th className="py-4 px-4 sm:px-6">Packaging Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A059]/15 text-taupe font-light">
              <tr className="hover:bg-[#C5A059]/5 transition-colors">
                <td className="py-4 px-5 sm:px-6 font-medium text-cream flex flex-col">
                  <span>Kerala (Intra-State)</span>
                  <span className="text-[11px] text-taupe/80">All 14 Districts (Kochi, Trivandrum, Calicut, etc.)</span>
                </td>
                <td className="py-4 px-4 sm:px-6 font-mono font-semibold text-emerald-400">₹80 Flat</td>
                <td className="py-4 px-4 sm:px-6">1 – 3 Business Days</td>
                <td className="py-4 px-4 sm:px-6 text-[11px] text-[#C5A059]">Cold-Pack Thermal Insulated</td>
              </tr>

              <tr className="hover:bg-[#C5A059]/5 transition-colors">
                <td className="py-4 px-5 sm:px-6 font-medium text-cream flex flex-col">
                  <span>South India (Metro & Non-Metro)</span>
                  <span className="text-[11px] text-taupe/80">Tamil Nadu, Karnataka, Andhra Pradesh, Telangana</span>
                </td>
                <td className="py-4 px-4 sm:px-6 font-mono font-semibold text-emerald-400">₹100 Flat</td>
                <td className="py-4 px-4 sm:px-6">2 – 4 Business Days</td>
                <td className="py-4 px-4 sm:px-6 text-[11px] text-[#C5A059]">Cold-Pack Air Cargo Express</td>
              </tr>

              <tr className="hover:bg-[#C5A059]/5 transition-colors">
                <td className="py-4 px-5 sm:px-6 font-medium text-cream flex flex-col">
                  <span>North, West & Central India</span>
                  <span className="text-[11px] text-taupe/80">Delhi NCR, Mumbai, Pune, Gujarat, Rajasthan, MP, UP</span>
                </td>
                <td className="py-4 px-4 sm:px-6 font-mono font-semibold text-emerald-400">₹100 Flat</td>
                <td className="py-4 px-4 sm:px-6">3 – 5 Business Days</td>
                <td className="py-4 px-4 sm:px-6 text-[11px] text-[#C5A059]">Heavy-Duty Thermal Barrier + Ice Gel</td>
              </tr>

              <tr className="hover:bg-[#C5A059]/5 transition-colors">
                <td className="py-4 px-5 sm:px-6 font-medium text-cream flex flex-col">
                  <span>North-East, J&K, Island Regions</span>
                  <span className="text-[11px] text-taupe/80">Assam, Meghalaya, Kashmir, Andaman & Nicobar, Lakshadweep</span>
                </td>
                <td className="py-4 px-4 sm:px-6 font-mono font-semibold text-emerald-400">₹100 Flat</td>
                <td className="py-4 px-4 sm:px-6">5 – 7 Business Days</td>
                <td className="py-4 px-4 sm:px-6 text-[11px] text-[#C5A059]">Priority Air Express + Multi-Gel Liner</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-[#160E0A] p-4 border border-[#C5A059]/20 flex items-start space-x-3 text-xs text-taupe">
          <Clock className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-cream">Fresh Handcrafting Window: </strong>
            Because THALF does not use artificial chemical preservatives or hydrogenated palm oils, chocolates are prepared fresh upon order placement. Please allow 24 to 48 hours for artisanal creation, tempering, and chilling prior to dispatch.
          </p>
        </div>
      </section>

      {/* 4. INTERACTIVE PIN CODE ESTIMATOR TOOL */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15">
        <div className="bg-gradient-to-r from-[#180E09] to-[#120B07] border border-[#C5A059]/40 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_right,_rgba(197,160,89,0.15),_transparent_70%)] pointer-events-none" />

          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] flex items-center space-x-2">
                <Search className="w-3.5 h-3.5" />
                <span>Instant Delivery Estimator</span>
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-cream font-light">
                Check Delivery Timeline For Your PIN Code
              </h3>
              <p className="text-xs sm:text-sm text-taupe font-light">
                Enter your 6-digit postal code to calculate exact shipping rates, next dispatch schedule, and thermal transit tier.
              </p>
            </div>

            <form onSubmit={handlePinCheck} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter 6-digit PIN code (e.g. 682001 or 110001)"
                className="bg-[#0B0604] border border-[#C5A059]/40 px-4 py-3 text-xs sm:text-sm text-cream placeholder:text-taupe/60 focus:outline-none focus:border-[#C5A059] font-mono flex-1"
                suppressHydrationWarning
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="px-6 py-3 bg-[#C5A059] text-[#0B0604] hover:bg-[#D4AF37] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Calculate Transit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {pinEstimate && (
              <div className="p-4 bg-[#0B0604]/90 border border-[#C5A059]/40 animate-fade-in text-xs sm:text-sm text-cream space-y-1">
                <div className="flex items-center space-x-2 text-[#C5A059] font-mono text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Serviceability & Estimate Verified</span>
                </div>
                <p className="text-taupe pt-1">{pinEstimate}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. MULTI-LAYER COLD CHAIN PACKAGING DIAGRAM */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] block">Engineered For Luxury</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-light text-cream">The 4-Layer Cold Shield Architecture</h2>
          <p className="text-xs sm:text-sm text-taupe font-light">
            How we protect pure single-origin cocoa butter from transit humidity and Indian ambient temperatures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 space-y-3 relative">
            <span className="text-xs font-mono font-bold text-[#C5A059] block">STAGE 01</span>
            <h4 className="font-editorial text-lg text-cream font-medium">Culinary Sealing</h4>
            <p className="text-xs text-taupe leading-relaxed">
              Every chocolate bar and confectionery piece is encased in food-safe airtight barrier wrapping to block ambient moisture and preserve delicate aromatics.
            </p>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 space-y-3 relative">
            <span className="text-xs font-mono font-bold text-[#C5A059] block">STAGE 02</span>
            <h4 className="font-editorial text-lg text-cream font-medium">Gel-Pack Chilling</h4>
            <p className="text-xs text-taupe leading-relaxed">
              Pharmaceutical-grade frozen cold-gel packs are layered alongside the product cavity to absorb external ambient heat and maintain chill.
            </p>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 space-y-3 relative">
            <span className="text-xs font-mono font-bold text-[#C5A059] block">STAGE 03</span>
            <h4 className="font-editorial text-lg text-cream font-medium">Reflective Thermal Foil</h4>
            <p className="text-xs text-taupe leading-relaxed">
              Parcels are wrapped in metallized thermal bubble insulation that deflects 97% of radiant heat waves experienced during flight and road haulage.
            </p>
          </div>

          <div className="bg-[#140C08] border border-[#C5A059]/20 p-5 space-y-3 relative">
            <span className="text-xs font-mono font-bold text-[#C5A059] block">STAGE 04</span>
            <h4 className="font-editorial text-lg text-cream font-medium">Shockproof Luxury Outer</h4>
            <p className="text-xs text-taupe leading-relaxed">
              The entire unit is nestled inside a rigid, high-density corrugated THALF gift box with tamper-evident security sealing.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CRUCIAL RECIPIENT ADVISORY (HEAT STABILIZATION PROTOCOL) */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15">
        <div className="bg-[#1E110A] border-l-4 border-l-[#C5A059] border border-[#C5A059]/30 p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-3 text-[#C5A059]">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-editorial text-xl sm:text-2xl text-cream font-medium">
              Essential Unboxing Guidance: Thermal Acclimation
            </h3>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-taupe font-light leading-relaxed">
            <p>
              When your parcel arrives from warm transit, the cocoa butter crystals may be soft. <strong className="text-cream">Do not tear open the parcel or put it directly into a freezing refrigerator immediately.</strong> Sudden temperature plunge can cause sugar condensation (bloom), clouding the mirror finish of the chocolate.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#0B0604] p-3 border border-[#C5A059]/20 space-y-1">
                <span className="text-[#C5A059] font-mono font-bold text-xs">Step 1: Cool Room Rest</span>
                <p className="text-[11px] text-taupe">Keep parcel sealed in an air-conditioned room (18°C–22°C) for 1–2 hours.</p>
              </div>
              <div className="bg-[#0B0604] p-3 border border-[#C5A059]/20 space-y-1">
                <span className="text-[#C5A059] font-mono font-bold text-xs">Step 2: Gentle Chill</span>
                <p className="text-[11px] text-taupe">If the afternoon was intensely hot, place in the middle shelf of the fridge for 20 mins.</p>
              </div>
              <div className="bg-[#0B0604] p-3 border border-[#C5A059]/20 space-y-1">
                <span className="text-[#C5A059] font-mono font-bold text-xs">Step 3: Savour at Room Temp</span>
                <p className="text-[11px] text-taupe">Enjoy your chocolates at comfortable room temperature (19°C–21°C) for optimal melt & aroma.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8 border-b border-[#C5A059]/15 space-y-8">
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C5A059]">Frequently Asked Questions</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-light text-cream">Shipping & Logistics Clarifications</h2>
        </div>

        <div className="space-y-3">
          {SHIPPING_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-[#C5A059]/25 bg-[#140C08] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  suppressHydrationWarning
                  className="w-full py-4 px-6 text-left flex items-center justify-between space-x-4 hover:bg-[#C5A059]/5 transition-colors"
                >
                  <span className="font-editorial text-base sm:text-lg text-cream font-medium">
                    {faq.question}
                  </span>
                  <span className="text-[#C5A059] flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-taupe leading-relaxed border-t border-[#C5A059]/15 font-light">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. CROSS-LINK POLICY FOOTER BANNER */}
      <section className="py-16 max-w-5xl mx-auto px-5 sm:px-8">
        <div className="bg-[#160E0A] border border-[#C5A059]/30 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-editorial text-2xl text-cream font-light">Need Assistance With An Existing Order?</h3>
            <p className="text-xs sm:text-sm text-taupe font-light">
              Explore our strict food return regulations, transit refund policies, or speak with our concierge directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/return-policy"
              className="px-5 py-3 border border-[#C5A059]/40 hover:border-[#C5A059] text-xs uppercase tracking-wider font-semibold text-cream hover:text-[#C5A059] transition-colors"
            >
              Return Policy &rarr;
            </Link>
            <Link
              href="/refund-policy"
              className="px-5 py-3 border border-[#C5A059]/40 hover:border-[#C5A059] text-xs uppercase tracking-wider font-semibold text-cream hover:text-[#C5A059] transition-colors"
            >
              Refund Policy &rarr;
            </Link>
            <a
              href="https://wa.me/919061107915?text=Hello%20THALF,%20I%20need%20assistance%20tracking%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#C5A059] text-[#0B0604] hover:bg-[#D4AF37] text-xs uppercase tracking-wider font-semibold transition-colors flex items-center space-x-1.5 shadow-md"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
