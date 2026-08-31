'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Gift, ArrowRight, Check, ShoppingBag, Eye, Sparkles, MessageCircle, Heart, Briefcase, PartyPopper } from 'lucide-react';
import { useCartStore } from '@/store/cart';

const HAMPER_CATEGORIES = [
  { id: 'ALL', name: 'All Special Hampers', icon: Gift },
  { id: 'Wedding Hampers', name: 'Wedding Hampers', icon: Heart, desc: 'Luxury handcrafted chocolate favors & wedding return gifts' },
  { id: 'Corporate / Bulk Hampers', name: 'Corporate & Bulk Gifting', icon: Briefcase, desc: 'Tailored corporate hampers with custom ribbon & company branding' },
  { id: 'Festival Specials', name: 'Festival Hampers', icon: Sparkles, desc: 'Curated artisanal collections for Diwali, Eid, Christmas & celebrations' },
  { id: 'Birthday Hampers', name: 'Birthday Hampers', icon: PartyPopper, desc: 'Delightful birthday chocolate boxes & personalized gift hampers' },
];

export default function CustomerHampersPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [hampers, setHampers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingState, setAddingState] = useState<Record<string, 'idle' | 'adding' | 'success'>>({});
  const { addItem, openCart, setQuickViewProduct } = useCartStore();

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

  const filteredHampers = hampers.filter((h) => {
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
    <div className="min-h-screen bg-cream text-dark">
      {/* Hero Header */}
      <section className="relative py-20 bg-dark text-cream border-b border-gold/30 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">
            Artisanal Gift Collections
          </span>
          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-cream">
            Special Hampers & Custom Gifting
          </h1>
          <p className="text-xs sm:text-sm text-parchment/80 font-light max-w-2xl mx-auto leading-relaxed">
            Crafted for weddings, corporate gifting, festivals, birthdays, and cherished milestones. Customized packaging, bespoke flavors, and express nationwide delivery.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 bg-champagne/40 border-b border-parchment sticky top-20 z-30 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start md:justify-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
            {HAMPER_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center space-x-2 px-5 py-3 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all duration-300 border ${
                    isActive
                      ? 'bg-dark text-gold border-gold shadow-md'
                      : 'bg-white/80 text-dark border-parchment hover:border-gold hover:bg-cream'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-taupe'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hampers Showcase Catalog */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-ultra text-taupe font-mono">Curating Luxury Hampers...</p>
          </div>
        ) : filteredHampers.length === 0 ? (
          <div className="py-20 text-center space-y-6 bg-white border border-parchment p-12 max-w-xl mx-auto">
            <Gift className="w-12 h-12 text-gold mx-auto stroke-[1.2]" />
            <h3 className="font-editorial text-2xl font-light text-dark">Custom Hamper Consultation</h3>
            <p className="text-xs text-taupe font-light leading-relaxed">
              We specialize in tailor-made hamper designs for weddings, corporate events, and festival celebrations.
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi THALF, I would like to inquire about custom special hampers for an event!')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-dark text-cream hover:bg-gold hover:text-dark text-xs uppercase tracking-ultra font-semibold transition-all duration-300 shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
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
                  className="group bg-white border border-parchment p-6 flex flex-col justify-between shadow-lux hover:shadow-2xl transition-all duration-500"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-ultra text-gold border border-gold/40 px-2.5 py-1 bg-cream">
                        {hamper.hamperType || 'Special Hamper'}
                      </span>
                      {isQuoteMode ? (
                        <span className="text-[9px] font-bold uppercase tracking-ultra bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 font-mono">
                          Custom Quote
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-ultra bg-emerald-900 text-cream px-2 py-0.5 font-mono">
                          Ready to Ship
                        </span>
                      )}
                    </div>

                    <div className="relative aspect-[4/3] bg-champagne/20 border border-parchment overflow-hidden mb-6 flex items-center justify-center p-4">
                      <Image
                        src={imageUrl}
                        alt={hamper.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-editorial text-2xl font-light text-dark group-hover:text-gold transition-colors">
                        {hamper.name}
                      </h3>
                      <p className="text-xs text-taupe font-light leading-relaxed line-clamp-3">
                        {hamper.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-parchment flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-ultra text-taupe block font-mono">Price</span>
                      <span className="text-xl font-editorial font-bold text-dark">
                        {isQuoteMode
                          ? hamper.startingPrice > 0
                            ? `From ₹${Number(hamper.startingPrice).toLocaleString('en-IN')}`
                            : 'Quote Only'
                          : `₹${Number(hamper.price || 1499).toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    {isQuoteMode ? (
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi THALF, I would like to request a custom quote for ${hamper.name}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-gold text-dark text-xs uppercase tracking-ultra font-semibold hover:bg-gold-light transition-colors flex items-center space-x-1.5 shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Enquire Quote</span>
                      </a>
                    ) : (
                      <button
                        disabled={currentState === 'adding'}
                        onClick={(e) => handleAddHamperToBag(hamper, e)}
                        className={`px-5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center space-x-1.5 ${
                          currentState === 'success'
                            ? 'bg-emerald-800 text-white'
                            : currentState === 'adding'
                            ? 'bg-gold/80 text-dark opacity-80'
                            : 'bg-dark text-cream hover:bg-gold hover:text-dark'
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

      {/* Corporate & Bulk Banner */}
      <section className="py-20 bg-dark text-cream border-t border-gold/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">Bespoke Enterprise Service</span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-light">Custom Corporate & Wedding Orders</h2>
          <p className="text-xs sm:text-sm text-parchment/80 font-light leading-relaxed max-w-2xl mx-auto">
            Need custom ribbons, engraved boxes, custom branded cards, or bulk orders above 50 units? Our concierge team builds custom chocolate hampers tailored to your brand identity or wedding aesthetic.
          </p>
          <div className="pt-2 flex justify-center items-center space-x-4">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi THALF Concierge, I need custom corporate/wedding hampers for an upcoming event.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gold text-dark hover:bg-gold-light text-xs font-semibold uppercase tracking-ultra transition-all duration-300 shadow-xl flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-950" />
              <span>Talk to Concierge Team</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
