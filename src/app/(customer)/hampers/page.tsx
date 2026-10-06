'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Gift, ArrowRight, Check, ShoppingBag, Sparkles, MessageCircle, Heart, Briefcase, PartyPopper } from 'lucide-react';
import { useCartStore } from '@/store/cart';

const HAMPER_CATEGORIES = [
  { id: 'ALL', name: 'All Special Hampers', icon: Gift },
  { id: 'Wedding Hampers', name: 'Wedding Favors', icon: Heart, desc: 'Luxury handcrafted chocolate favors & wedding return gifts' },
  { id: 'Corporate / Bulk Hampers', name: 'Corporate & Bulk', icon: Briefcase, desc: 'Tailored corporate hampers with custom ribbon & company branding' },
  { id: 'Festival Specials', name: 'Festival Editions', icon: Sparkles, desc: 'Curated artisanal collections for Diwali, Eid, Christmas & celebrations' },
  { id: 'Birthday Hampers', name: 'Birthday Hampers', icon: PartyPopper, desc: 'Delightful birthday chocolate boxes & personalized gift hampers' },
];

export default function CustomerHampersPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [hampers, setHampers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingState, setAddingState] = useState<Record<string, 'idle' | 'adding' | 'success'>>({});
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function loadHampers() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/hampers');
        const data = await res.json();
        if (data.success && Array.isArray(data.hampers)) {
          setHampers(data.hampers);
        }
      } catch (err) {
        console.error('Failed to load hampers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHampers();
  }, []);

  const DEFAULT_STATIC_HAMPERS = [
    {
      id: 'static-wedding-1',
      name: 'Royal Heritage Wedding Hamper',
      hamperType: 'Wedding Hampers',
      pricingMode: 'QUOTE_REQUIRED',
      startingPrice: 2499,
      images: ['/images/hampers/wedding-hamper.png'],
      description: 'Handcrafted luxury chocolate favor box featuring gold-leaf truffles, custom wedding crest ribbon, and artisanal cocoa bars. Perfect for grand wedding return gifts.',
    },
    {
      id: 'static-corporate-1',
      name: 'Executive Corporate Elite Box',
      hamperType: 'Corporate / Bulk Hampers',
      pricingMode: 'QUOTE_REQUIRED',
      startingPrice: 1999,
      images: ['/images/hampers/corporate-hamper.png'],
      description: 'Sophisticated executive chocolate box with custom corporate logo sleeve, premium single-origin truffles, and personalized thank-you note card for clients & staff.',
    },
    {
      id: 'static-festival-1',
      name: 'Grand Celebration Festive Box',
      hamperType: 'Festival Specials',
      pricingMode: 'FIXED_PRICE',
      price: 1899,
      images: ['/images/hampers/festival-hamper.png'],
      description: 'Festive artisanal chocolate collection packed with roasted caramel nut rocks, dates chocolates, and gold-foil wrapped delight bars for Diwali, Eid & celebrations.',
    },
    {
      id: 'static-birthday-1',
      name: 'Signature Birthday Deluxe Hamper',
      hamperType: 'Birthday Hampers',
      pricingMode: 'FIXED_PRICE',
      price: 1499,
      images: ['/images/hampers/birthday-hamper.png'],
      description: 'A rich assortment of Kunafa chocolates, crunch rock chocolates, and personalized birthday greeting sleeve. Wrapped in elegant silk ribbon.',
    },
  ];

  const displayHampers = hampers.length > 0 ? hampers : DEFAULT_STATIC_HAMPERS;

  const filteredHampers = displayHampers.filter((h) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'Festival Specials') return h.hamperType?.includes('Festival') || h.hamperType?.includes('Custom');
    return h.hamperType === activeCategory;
  });

  const handleAddHamperToBag = (hamper: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingState[hamper.id] === 'adding') return;

    setAddingState((prev) => ({ ...prev, [hamper.id]: 'adding' }));
    const imageUrl =
      Array.isArray(hamper.images) && hamper.images[0]
        ? typeof hamper.images[0] === 'string' ? hamper.images[0] : hamper.images[0].url
        : '/images/hero-chocolate.png';

    addItem({
      productId: hamper.id,
      productName: hamper.name,
      price: Number(hamper.price || hamper.startingPrice || 1499),
      quantity: 1,
      image: imageUrl,
      sku: hamper.sku,
    });

    setTimeout(() => {
      setAddingState((prev) => ({ ...prev, [hamper.id]: 'success' }));
      if (typeof openCart === 'function') openCart();
      setTimeout(() => setAddingState((prev) => ({ ...prev, [hamper.id]: 'idle' })), 1500);
    }, 250);
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919061107915';

  return (
    <div className="min-h-screen bg-[#100805] text-[#F4EBDD] selection:bg-[#B88A42] selection:text-[#100805]">
      {/* 1. Header Banner */}
      <section className="relative pt-24 pb-20 bg-gradient-to-b from-[#0B0604] via-[#140A06] to-[#100805] border-b border-[#B88A42]/20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(184,138,66,0.12),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 border border-[#B88A42]/40 bg-[#170B07] text-[#B88A42] text-[10px] uppercase font-bold tracking-widest">
            <Sparkles className="w-3 h-3 text-[#D09A4E]" />
            <span>BESPOKE GIFTING & CELEBRATIONS</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-light text-[#F4EBDD] tracking-tight leading-tight">
            Special Hampers & <br />
            <span className="italic font-normal text-[#D09A4E]">Artisanal Gift Boxes</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#B9AA99] font-light max-w-2xl mx-auto leading-relaxed">
            Crafted for weddings, corporate milestones, festivals, and unforgettable moments. 
            Customized packaging, gold foil finishes, and express nationwide delivery.
          </p>
        </div>
      </section>

      {/* 2. Category Selector */}
      <section className="py-6 bg-[#0E0604] border-b border-[#B88A42]/20 sticky top-20 z-30 backdrop-blur-xl bg-opacity-95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start md:justify-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
            {HAMPER_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  suppressHydrationWarning
                  className={`flex items-center space-x-2 px-5 py-2.5 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all duration-300 border ${
                    isActive
                      ? 'bg-[#B88A42] text-[#100805] border-[#B88A42] shadow-[0_0_20px_rgba(184,138,66,0.3)]'
                      : 'bg-[#170B07] text-[#F4EBDD]/80 border-[#B88A42]/20 hover:border-[#B88A42]/60 hover:text-[#F4EBDD]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#100805]' : 'text-[#B88A42]'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Hampers Catalog Grid */}
      <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-28 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#B88A42] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest text-[#B9AA99] font-mono">Curating Luxury Hampers...</p>
          </div>
        ) : filteredHampers.length === 0 ? (
          <div className="py-20 text-center space-y-6 bg-[#1A0D08] border border-[#B88A42]/30 p-12 max-w-xl mx-auto shadow-2xl">
            <Gift className="w-12 h-12 text-[#B88A42] mx-auto stroke-[1.2]" />
            <h3 className="font-editorial text-2xl font-light text-[#F4EBDD]">Custom Hamper Consultation</h3>
            <p className="text-xs text-[#B9AA99] font-light leading-relaxed">
              We specialize in tailor-made hamper designs for weddings, corporate celebrations, and VIP events.
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi THALF, I would like to inquire about custom special hampers for an event!')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-lg"
            >
              <MessageCircle className="w-4 h-4 text-[#100805]" />
              <span>Request Custom Bulk Quote</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHampers.map((hamper) => {
              const imageUrl =
                Array.isArray(hamper.images) && hamper.images[0]
                  ? typeof hamper.images[0] === 'string' ? hamper.images[0] : hamper.images[0].url
                  : '/images/hero-chocolate.png';
              const currentState = addingState[hamper.id] || 'idle';
              const isQuoteMode = hamper.pricingMode === 'QUOTE_REQUIRED';

              return (
                <div
                  key={hamper.id}
                  className="group bg-[#170B07] border border-[#B88A42]/25 hover:border-[#D09A4E]/60 p-6 flex flex-col justify-between transition-all duration-500 shadow-xl hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)] relative"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#B88A42] border border-[#B88A42]/40 px-2.5 py-1 bg-[#100805]">
                        {hamper.hamperType || 'Special Hamper'}
                      </span>
                      {isQuoteMode ? (
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-[#2E1A10] text-[#D09A4E] border border-[#B88A42]/40 px-2.5 py-1 font-mono">
                          Bespoke Quote
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 px-2.5 py-1 font-mono">
                          Ready to Ship
                        </span>
                      )}
                    </div>

                    {/* Image Cavity */}
                    <div className="relative aspect-[4/3] bg-gradient-to-b from-[#100805] to-[#0A0402] border border-[#B88A42]/20 overflow-hidden mb-6 flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(184,138,66,0.12),transparent_65%)] pointer-events-none" />
                      <Image
                        src={imageUrl}
                        alt={hamper.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-700 ease-out p-2"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-2.5">
                      <h3 className="font-editorial text-2xl font-light text-[#F4EBDD] group-hover:text-[#D09A4E] transition-colors leading-snug">
                        {hamper.name}
                      </h3>
                      <p className="text-xs text-[#B9AA99] font-light leading-relaxed line-clamp-3">
                        {hamper.description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="mt-8 pt-5 border-t border-[#B88A42]/20 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#B9AA99]/80 block font-mono">Price</span>
                      <span className="text-xl font-editorial font-bold text-[#F4EBDD]">
                        {isQuoteMode
                          ? hamper.startingPrice > 0
                            ? `From ₹${Number(hamper.startingPrice).toLocaleString('en-IN')}`
                            : 'Custom Quote'
                          : `₹${Number(hamper.price || 1499).toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    {isQuoteMode ? (
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi THALF, I would like to request a bespoke quote for ${hamper.name}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-[#B88A42] text-[#100805] text-xs uppercase tracking-widest font-semibold hover:bg-[#D09A4E] transition-colors flex items-center space-x-1.5 shadow-md"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Enquire</span>
                      </a>
                    ) : (
                      <button
                        disabled={currentState === 'adding'}
                        onClick={(e) => handleAddHamperToBag(hamper, e)}
                        suppressHydrationWarning
                        className={`px-5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center space-x-1.5 ${
                          currentState === 'success'
                            ? 'bg-emerald-700 text-white'
                            : currentState === 'adding'
                            ? 'bg-[#B88A42]/80 text-[#100805] opacity-80'
                            : 'bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] hover:shadow-[0_0_15px_rgba(184,138,66,0.3)]'
                        }`}
                      >
                        {currentState === 'adding' ? (
                          <span>Adding...</span>
                        ) : currentState === 'success' ? (
                          <><Check className="w-3.5 h-3.5" /><span>Added</span></>
                        ) : (
                          <><ShoppingBag className="w-3.5 h-3.5" /><span>Add to Bag</span></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Corporate & Wedding Concierge Banner */}
      <section className="py-24 bg-gradient-to-b from-[#100805] to-[#080403] border-t border-[#B88A42]/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A42] block">
            BESPOKE ENTERPRISE & WEDDING ATELIER
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-light text-[#F4EBDD]">
            Custom Corporate & Wedding Orders
          </h2>
          <p className="text-xs sm:text-sm text-[#B9AA99] font-light leading-relaxed max-w-2xl mx-auto">
            Need custom foil stamping, silk ribbons, engraved keepsake boxes, or bulk curation above 50 units? 
            Our master chocolatiers work directly with your team to deliver unmatched elegance.
          </p>
          <div className="pt-4 flex justify-center items-center space-x-4">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi THALF Concierge, I need custom corporate/wedding hampers for an upcoming event.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4 text-[#100805]" />
              <span>Talk to Concierge Atelier</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
