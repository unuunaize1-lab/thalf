'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Eye, ShoppingBag, Check, MessageCircle, Sparkles, Gift } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { Product } from '@/types';

import { CustomerReviewsSection } from '@/components/shop/customer-reviews-section';
import { ClientPhotoGallerySection } from '@/components/shop/client-photo-gallery-section';
import HeroSection from '@/components/home/hero-section';

const DEFAULT_REAL_PRODUCTS: any[] = [
  {
    id: 'default-rock',
    name: 'Rock Chocolate',
    slug: 'rock-chocolate',
    sku: 'THALF-ROCK-70',
    price: 70,
    weight: '4 pcs',
    category: 'ARTISANAL CHOCOLATES',
    description: 'Crispy golden cornflakes tossed in velvety milk chocolate, handcrafted into delightful crunch rocks.',
    shortDescription: 'Milk chocolate & crunchy cornflakes (4 pcs)',
    ingredients: 'Milk chocolate, cornflakes',
    tastingNotes: ['Milk Chocolate', 'Crispy Cornflakes', 'Crunchy Texture'],
    storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
    shelfLife: '3 Months',
    images: [{ url: '/images/choclates/rock-chocolate.jpeg', alt: 'Rock Chocolate' }],
    status: 'ACTIVE',
    featured: true,
  },
  {
    id: 'default-dates',
    name: 'Dates Chocolate',
    slug: 'dates-chocolate',
    sku: 'THALF-DATE-100',
    price: 100,
    weight: '4 pcs',
    category: 'STUFFED DELICACIES',
    description: 'Premium stuffed dates with roasted cashews & roasted almonds, enrobed in a rich blend of milk and dark chocolate.',
    shortDescription: 'Milk & dark chocolate dates with roasted cashew & almond (4 pcs)',
    ingredients: 'Milk chocolate, dark chocolate, dates, roasted cashew, roasted almond',
    tastingNotes: ['Rich Date Sweetness', 'Roasted Cashew', 'Roasted Almond', 'Milk & Dark Blend'],
    storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
    shelfLife: '3 Months',
    images: [{ url: '/images/choclates/dates-chocolate.jpeg', alt: 'Dates Chocolate' }],
    status: 'ACTIVE',
    featured: true,
  },
  {
    id: 'default-lollypop',
    name: 'Chocolate Lollypop',
    slug: 'chocolate-lollypop',
    sku: 'THALF-LOL-50',
    price: 50,
    weight: '3 pcs',
    category: 'ARTISANAL CHOCOLATES',
    description: 'Handcrafted chocolate pops made with smooth milk chocolate and creamy white chocolate layers.',
    shortDescription: 'Milk chocolate & white chocolate pops (3 pcs)',
    ingredients: 'Milk chocolate, white chocolate',
    tastingNotes: ['Creamy White Chocolate', 'Smooth Milk Chocolate', 'Playful & Sweet'],
    storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
    shelfLife: '3 Months',
    images: [{ url: '/images/choclates/lollypop.jpeg', alt: 'Chocolate Lollypop' }],
    status: 'ACTIVE',
    featured: false,
  },
  {
    id: 'default-kunafa',
    name: 'Kunafa Chocolate',
    slug: 'kunafa-chocolate',
    sku: 'THALF-KUN-70',
    price: 70,
    weight: '25g (Mini bites)',
    category: 'SIGNATURE CREATIONS',
    description: 'Crispy Middle-Eastern style kunafa pastry and pistachio butter wrapped in luscious milk chocolate.',
    shortDescription: 'Milk chocolate, pistachio, kunafa & butter (Mini bites 25g)',
    ingredients: 'Milk chocolate, pistachio, kunafa, butter',
    tastingNotes: ['Crispy Kunafa Pastry', 'Pistachio Butter', 'Milk Chocolate'],
    storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
    shelfLife: '2 Months',
    images: [{ url: '/images/choclates/kunafa-pistachio.jpeg', alt: 'Kunafa Chocolate' }],
    status: 'ACTIVE',
    featured: true,
  },
  {
    id: 'default-caramel',
    name: 'Caramel Nuts',
    slug: 'caramel-nuts',
    sku: 'THALF-CAR-80',
    price: 80,
    weight: '5 pcs',
    category: 'ARTISANAL CHOCOLATES',
    description: 'Decadent milk chocolate bites filled with buttery caramel, roasted cashews, and roasted almonds.',
    shortDescription: 'Milk chocolate, roasted cashew, roasted almond & caramel (5 pcs)',
    ingredients: 'Milk chocolate, roasted cashew, roasted almond, caramel',
    tastingNotes: ['Golden Butter Caramel', 'Roasted Cashew', 'Roasted Almond', 'Milk Chocolate'],
    storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
    shelfLife: '3 Months',
    images: [{ url: '/images/choclates/caramel-chocolate.jpeg', alt: 'Caramel Nuts' }],
    status: 'ACTIVE',
    featured: true,
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_REAL_PRODUCTS);
  const [addingState, setAddingState] = useState<Record<string, 'idle' | 'adding' | 'success'>>({});

  const { setQuickViewProduct, addItem, openCart } = useCartStore();

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const prodRes = await fetch('/api/v1/products?limit=20').catch(() => null);
        if (prodRes && prodRes.ok) {
          const data = await prodRes.json();
          if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error('HomePage load error:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDirectAddToBag = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingState[product.id] === 'adding') return;
    setAddingState((prev) => ({ ...prev, [product.id]: 'adding' }));
    const imageUrl =
      Array.isArray(product.images) && product.images[0]
        ? typeof product.images[0] === 'string'
          ? product.images[0]
          : product.images[0].url
        : '/images/choclates/rock-chocolate.jpeg';
    addItem({ productId: product.id, productName: product.name, price: Number(product.price), quantity: 1, image: imageUrl, sku: product.sku });
    setTimeout(() => {
      setAddingState((prev) => ({ ...prev, [product.id]: 'success' }));
      if (typeof openCart === 'function') openCart();
      setTimeout(() => setAddingState((prev) => ({ ...prev, [product.id]: 'idle' })), 1500);
    }, 250);
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919061107915';

  // Editorial Chocolate Product Panel Component
  const renderProductPanel = (product: Product, aspectClass = 'aspect-[4/3]') => {
    const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'ARTISANAL CHOCOLATES');
    const imageUrl =
      Array.isArray(product.images) && product.images[0]
        ? typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url
        : '/images/choclates/rock-chocolate.jpeg';
    const stockQty = product.inventory ? product.inventory.stockQuantity - (product.inventory.reservedStock || 0) : 50;
    const isOutOfStock = stockQty <= 0;
    const currentState = addingState[product.id] || 'idle';

    return (
      <div 
        key={product.id} 
        className="group relative bg-[#1A0D08] border border-[#B88A42]/22 hover:border-[#B88A42]/60 p-6 sm:p-7 flex flex-col justify-between transition-all duration-500 ease-out hover:shadow-[0_20px_50px_-15px_rgba(208,154,78,0.18)] hover:-translate-y-1 h-full select-none overflow-hidden"
      >
        {/* Subtle Warm Amber Glow Behind Card on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D09A4E]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div>
          {/* Top Metadata Row */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#B88A42]">
              {categoryName}
            </span>
            {isOutOfStock && (
              <span className="text-[9px] font-mono uppercase tracking-widest bg-red-950/80 text-red-200 border border-red-800/60 px-2 py-0.5">
                Out of Stock
              </span>
            )}
          </div>

          {/* Large Dominant Product Photograph with Dark Cavity & Warm Grading */}
          <div className={`relative w-full ${aspectClass} bg-[#120704] overflow-hidden mb-6 flex items-center justify-center p-4 border border-[#B88A42]/15 shadow-inner`}>
            {/* Ambient Radial Spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(208,154,78,0.14),_transparent_72%)] pointer-events-none" />

            <Image 
              src={imageUrl} 
              alt={product.name} 
              fill 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-[1.04] ${isOutOfStock ? 'grayscale opacity-60' : ''}`} 
            />

            {/* Quick View Button */}
            <button 
              onClick={() => setQuickViewProduct(product)} 
              suppressHydrationWarning
              className="absolute bottom-3 right-3 bg-[#0B0604]/85 text-[#B9AA99] hover:text-[#B88A42] p-2.5 shadow-xl backdrop-blur-md border border-[#B88A42]/30 opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95" 
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Editorial Product Information */}
          <div className="space-y-2 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
            <h3 className="font-editorial text-2xl sm:text-3xl font-light text-[#F4EBDD] group-hover:text-[#D09A4E] transition-colors duration-300 leading-snug">
              <Link href={`/shop/${product.slug || product.id}`}>{product.name}</Link>
            </h3>

            <p className="text-xs sm:text-sm text-[#B9AA99] font-light line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {product.weight && (
              <div className="pt-1">
                <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-[#B88A42] bg-[#B88A42]/10 border border-[#B88A42]/25 px-2.5 py-0.5">
                  PACK · {product.weight.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Price & Minimal Luxury CTA */}
        <div className="mt-8 pt-4 border-t border-[#B88A42]/20 flex items-center justify-between relative z-10">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-editorial font-bold text-[#D09A4E]">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs font-mono text-[#B9AA99]/60 line-through">
                ₹{Number(product.compareAtPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            disabled={isOutOfStock || currentState === 'adding'}
            onClick={(e) => !isOutOfStock && handleDirectAddToBag(product, e)}
            suppressHydrationWarning
            className={`px-4 sm:px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 flex items-center space-x-1.5 shadow-md ${
              isOutOfStock 
                ? 'bg-[#211109] text-[#B9AA99]/40 cursor-not-allowed border border-[#B88A42]/15' 
                : currentState === 'success' 
                ? 'bg-emerald-900 text-white border border-emerald-500' 
                : currentState === 'adding' 
                ? 'bg-[#B88A42]/80 text-[#100805] opacity-80' 
                : 'bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] hover:shadow-[0_4px_20px_rgba(184,138,66,0.35)]'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : currentState === 'adding' ? (
              <span>Adding...</span>
            ) : currentState === 'success' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added ✓</span>
              </>
            ) : (
              <>
                <span>ADD TO BAG</span>
                <span className="text-xs">→</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#100805] text-[#F4EBDD] min-h-screen selection:bg-[#B88A42] selection:text-[#100805]" suppressHydrationWarning>
      
      {/* 1. HERO SECTION (UNCHANGED AS INSTRUCTED) */}
      <HeroSection />

      {/* NATURAL DARK CHOCOLATE FADE TRANSITION BETWEEN HERO & COLLECTION */}
      <div className="h-16 bg-gradient-to-b from-[#0B0604] via-[#0E0705] to-[#120805] -mt-1 relative z-20 pointer-events-none" />

      {/* 2. COLLECTION SECTION (THE THALF COLLECTION) */}
      <section id="collection" className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl relative z-10 border-b border-[#B88A42]/20">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.35em] text-[#B88A42] block">
            OUR CHOCOLATES
          </span>
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-light text-[#F4EBDD] tracking-tight">
            The THALF Collection
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#B9AA99] font-light leading-relaxed max-w-xl mx-auto">
            A collection made for moments of indulgence and sharing.
          </p>
        </div>

        {/* Large Editorial Chocolate Panels Grid */}
        <div>
          {products.length <= 3 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {products.map((p) => renderProductPanel(p, 'aspect-[4/3]'))}
            </div>
          ) : products.length === 5 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.slice(0, 3).map((p) => renderProductPanel(p, 'aspect-[4/3]'))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {products.slice(3, 5).map((p) => renderProductPanel(p, 'aspect-[16/10]'))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p) => renderProductPanel(p, 'aspect-[4/3]'))}
            </div>
          )}
        </div>

        {/* Minimal Luxury View All CTA */}
        {products.length > 0 && (
          <div className="text-center mt-16">
            <Link 
              href="/shop" 
              className="group inline-flex items-center space-x-3 px-9 py-4 border border-[#B88A42]/40 text-[#F4EBDD] hover:bg-[#B88A42] hover:text-[#100805] hover:border-[#B88A42] text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 shadow-xl"
            >
              <span>VIEW ALL CHOCOLATES</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </section>

      {/* 3. SIGNATURE CREATIONS (FULL-WIDTH CINEMATIC CHOCOLATE SECTION) */}
      <section className="relative py-32 sm:py-40 bg-[#0B0604] text-[#F4EBDD] overflow-hidden border-b border-[#B88A42]/20">
        {/* Full-bleed Cinematic Chocolate Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="/images/thalf-signature-craft.jpg"
            alt="THALF Artisanal Melted Cocoa & Chocolate Craft"
            fill
            priority
            quality={90}
            className="object-cover object-right sm:object-center opacity-85"
          />
          {/* Left-side Dark Vignette for Pristine Editorial Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0604] via-[#0B0604]/80 to-transparent lg:w-3/4" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0604]/90 via-[#0B0604]/40 to-transparent" />
          {/* Top & Bottom Seamless Blends */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#100805] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0B0604] to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            
            <div className="inline-flex items-center space-x-3 text-[11px] font-mono font-bold uppercase tracking-[0.35em] text-[#B88A42]">
              <span className="w-8 h-[1.5px] bg-[#B88A42] inline-block shadow-[0_0_8px_rgba(184,138,66,0.6)]" />
              <span>THE ART OF THALF</span>
            </div>

            <h2 className="font-editorial text-5xl sm:text-7xl lg:text-8xl font-light text-[#F4EBDD] leading-[0.95] tracking-tight">
              CRAFTED<br />
              TO BE<br />
              <span className="text-[#D09A4E]">REMEMBERED.</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-[#B9AA99] font-light max-w-xl leading-relaxed">
              Every creation is an ode to the quiet pleasure of pure cocoa, slow tempering, and balanced sweetness. Confectionery created for moments that linger.
            </p>

            <div className="pt-4">
              <Link
                href="/about/our-craft"
                className="group inline-flex items-center space-x-3 px-8 py-4 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(184,138,66,0.35)]"
              >
                <span>Discover Our Craft</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 stroke-[2.2]" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. BESTSELLERS (THE ONES EVERYONE LOVES) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl border-b border-[#B88A42]/20 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#B88A42]/15 pb-8 mb-14">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#B88A42] block">
              CURATED SELECTION
            </span>
            <h2 className="font-editorial text-4xl sm:text-6xl font-light text-[#F4EBDD] leading-tight">
              THE ONES<br />
              <span className="text-[#D09A4E]">EVERYONE LOVES.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#B9AA99] font-light max-w-md leading-relaxed">
            Our most requested recipes—from roasted cashew-stuffed dates to crunchy cornflake rocks.
          </p>
        </div>

        {/* 2-Column Horizontal Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {products.slice(0, 2).map((item) => (
            <div 
              key={`bestseller-${item.id}`}
              className="group bg-[#170B07] border border-[#B88A42]/25 hover:border-[#B88A42]/60 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center transition-all duration-500 hover:shadow-[0_20px_45px_-10px_rgba(208,154,78,0.15)]"
            >
              <div className="relative w-full sm:w-48 aspect-square bg-[#0E0704] border border-[#B88A42]/20 flex-shrink-0 flex items-center justify-center p-3 overflow-hidden shadow-inner">
                <Image
                  src={Array.isArray(item.images) && item.images[0] ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url) : '/images/choclates/rock-chocolate.jpeg'}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 200px"
                  className="object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="flex-1 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#B88A42] block">
                    Bestseller · {item.weight || '4 pcs'}
                  </span>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-light text-[#F4EBDD] group-hover:text-[#D09A4E] transition-colors mt-1">
                    <Link href={`/shop/${item.slug || item.id}`}>{item.name}</Link>
                  </h3>
                  <p className="text-xs text-[#B9AA99] font-light line-clamp-2 leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#B88A42]/15">
                  <span className="font-editorial text-2xl font-bold text-[#D09A4E]">
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={(e) => handleDirectAddToBag(item, e)}
                    suppressHydrationWarning
                    className="px-4 py-2 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300"
                  >
                    ADD TO BAG →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. OUR STORY (EDITORIAL SPLIT LAYOUT) */}
      <section id="story" className="py-24 sm:py-32 bg-[#170B07] border-b border-[#B88A42]/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left: Large Real THALF Image in Artisanal Dark Frame */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto bg-[#0E0704] border border-[#B88A42]/30 p-4 shadow-2xl group">
                <div className="relative w-full h-full overflow-hidden border border-[#B88A42]/20">
                  <Image
                    src="/images/choclates/dates-chocolate.jpeg"
                    alt="THALF Artisanal Craftsmanship"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0704]/80 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Gold Inscription Corner Accent */}
                <div className="absolute -bottom-3 -right-3 bg-[#100805] border border-[#B88A42]/40 px-4 py-2 text-[10px] font-mono tracking-widest text-[#B88A42] shadow-xl">
                  EST. KERALA · 2026
                </div>
              </div>
            </div>

            {/* Right: Editorial Typography & Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#B88A42] block">
                  OUR STORY
                </span>
                <h2 className="font-editorial text-4xl sm:text-6xl font-light text-[#F4EBDD] leading-[1.05] tracking-tight">
                  MORE THAN<br />
                  <span className="text-[#D09A4E]">CHOCOLATE.</span>
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#B9AA99] font-light leading-relaxed">
                <p>
                  THALF was born from a desire to strip away artificial excess and restore chocolate to its most honest, comforting state. We believed sweets shouldn’t overwhelm your senses with cloying sugar, but instead whisper notes of roasted cocoa, nutty crunch, and smooth cream.
                </p>
                <p>
                  Handcrafted in Kerala in strictly small batches, each creation pairs single-origin cocoa with hand-selected roasted almonds, toasted cashews, and delicate Middle-Eastern kunafa. We take no shortcuts, use no hydrogenated palm oils, and chill every batch with meticulous patience.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/about/our-craft"
                  className="group inline-flex items-center space-x-3 px-8 py-4 border border-[#B88A42]/45 text-[#F4EBDD] hover:bg-[#B88A42] hover:text-[#100805] hover:border-[#B88A42] text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300"
                >
                  <span>DISCOVER OUR STORY</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CRAFTSMANSHIP (MADE BY HAND. MADE WITH INTENT.) */}
      <section className="py-24 sm:py-32 bg-[#120805] border-b border-[#B88A42]/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#B88A42] block">
              PHILOSOPHY & TECHNIQUE
            </span>
            <h2 className="font-editorial text-4xl sm:text-6xl font-light text-[#F4EBDD] tracking-tight">
              MADE BY HAND.<br />
              <span className="text-[#D09A4E]">MADE WITH INTENT.</span>
            </h2>
          </div>

          {/* Four Editorial Pillars with Thin Gold Divider Lines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: '01',
                title: 'SMALL BATCH',
                desc: 'Crafted in strictly limited weekly batches in Kerala to guarantee peak aroma, silky melt, and uncompromising freshness.',
              },
              {
                num: '02',
                title: 'PREMIUM INGREDIENTS',
                desc: 'Pure single-origin cocoa, roasted whole almonds, roasted cashews, and dairy butter with zero hydrogenated vegetable fats.',
              },
              {
                num: '03',
                title: 'HANDCRAFTED',
                desc: 'Each slab, crunch rock, and enrobed date is tempered and hand-finished by master chocolatiers with quiet devotion.',
              },
              {
                num: '04',
                title: 'MADE TO SHARE',
                desc: 'Thoughtfully presented in keepsake presentation boxes designed to turn ordinary moments into unforgettable memories.',
              },
            ].map((pillar) => (
              <div 
                key={pillar.num}
                className="p-6 sm:p-8 bg-[#1A0D08]/60 border border-[#B88A42]/20 hover:border-[#B88A42]/50 transition-colors duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold text-[#B88A42] block pb-2 border-b border-[#B88A42]/20">
                    {pillar.num}
                  </span>
                  <h3 className="font-editorial text-xl sm:text-2xl font-normal text-[#F4EBDD]">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B9AA99] font-light leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. GIFTING (SOME MOMENTS DESERVE CHOCOLATE.) */}
      <section className="py-24 sm:py-32 bg-[#190C07] border-b border-[#B88A42]/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#B88A42]/20 pb-8">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#B88A42] block">
                ARTISANAL HAMPERS
              </span>
              <h2 className="font-editorial text-4xl sm:text-6xl font-light text-[#F4EBDD] leading-tight">
                SOME MOMENTS<br />
                DESERVE<br />
                <span className="text-[#D09A4E]">CHOCOLATE.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#B9AA99] font-light max-w-lg leading-relaxed pt-2">
                Curated gift hampers for Weddings, Corporate Bulk Gifting, Festive Celebrations & Birthday Milestones.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
              <Link
                href="/hampers"
                className="px-7 py-3.5 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg"
              >
                <span>SHOP GIFTS</span>
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello THALF, I would like to build a custom chocolate gift hamper.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 border border-[#B88A42]/45 text-[#F4EBDD] hover:bg-[#B88A42] hover:text-[#100805] text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300"
              >
                <span>BUILD A GIFT</span>
              </a>
            </div>
          </div>

          {/* 4 Luxury Gift Hampers Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Wedding Hampers',
                subtitle: 'Marriage Favors & Bespoke Flavors',
                tag: 'Bespoke Flavors',
                image: '/images/hampers/wedding-hamper.png',
                link: '/hampers',
              },
              {
                title: 'Corporate Gifting',
                subtitle: 'Custom Logo Branding & Ribbon',
                tag: 'Bulk Pricing',
                image: '/images/hampers/corporate-hamper.png',
                link: '/hampers',
              },
              {
                title: 'Festival Hampers',
                subtitle: 'Diwali, Eid & Festive Specials',
                tag: 'Festive Box',
                image: '/images/hampers/festival-hamper.png',
                link: '/hampers',
              },
              {
                title: 'Birthday Hampers',
                subtitle: 'Personalized Chocolate Boxes',
                tag: 'Custom Note',
                image: '/images/hampers/birthday-hamper.png',
                link: '/hampers',
              },
            ].map((h, i) => (
              <Link
                key={i}
                href={h.link}
                className="group bg-[#211109] border border-[#B88A42]/22 p-6 flex flex-col justify-between hover:border-[#B88A42] hover:bg-[#28150C] transition-all duration-500 shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#B88A42] bg-[#B88A42]/10 border border-[#B88A42]/30 px-2.5 py-0.5">
                      {h.tag}
                    </span>
                    <Gift className="w-4 h-4 text-[#B88A42] group-hover:scale-110 transition-transform" />
                  </div>

                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#120704] border border-[#B88A42]/20 p-2 shadow-inner">
                    <Image
                      src={h.image}
                      alt={h.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div>
                    <h3 className="font-editorial text-2xl font-normal text-[#F4EBDD] group-hover:text-[#D09A4E] transition-colors">
                      {h.title}
                    </h3>
                    <p className="text-xs text-[#B9AA99] font-light mt-1">{h.subtitle}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#B88A42]/20 flex items-center justify-between mt-6">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#B88A42]">View Hamper</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B88A42] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 8. REAL CUSTOMER REVIEWS SHOWCASE (DARK CHOCOLATE PALETTE) */}
      <CustomerReviewsSection />

      {/* 9. REAL THALF CLIENT PHOTO GALLERY */}
      <ClientPhotoGallerySection />

      {/* 10. INSTAGRAM (FOLLOW THE TASTE / @THALFCHOCOLATES) */}
      <section className="py-24 bg-[#100805] border-b border-[#B88A42]/20 text-center relative overflow-hidden">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#B88A42] block">
              FOLLOW THE TASTE
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-light text-[#F4EBDD] tracking-tight">
              @thalf_chococraft
            </h2>
            <p className="text-xs sm:text-sm text-[#B9AA99] font-light leading-relaxed max-w-md mx-auto">
              Follow our daily tempering journeys, secret releases, and behind-the-scenes moments from our Kerala ateliers.
            </p>
          </div>

          <div className="pt-2">
            <a 
              href="https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDM3ODQ0Nzc0NzA0NDgz?story_media_id=3731029645358965602_77080028562&igsh=MTZvY2JqeGJxam9mZQ==&igsi=MTZvY2JqeGJxam9mZQ==" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block px-8 py-3.5 border border-[#B88A42]/45 text-[#F4EBDD] hover:bg-[#B88A42] hover:text-[#100805] hover:border-[#B88A42] text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-300 shadow-lg"
            >
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* 11. WHATSAPP CONCIERGE (PREFER A PERSONAL TOUCH?) */}
      {whatsappNumber && (
        <section className="py-20 bg-[#0D0704] text-[#F4EBDD] border-b border-[#B88A42]/15">
          <div className="mx-auto max-w-4xl px-4 text-center space-y-5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#B88A42] block">
              PERSONAL CONCIERGE
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-light text-[#F4EBDD]">
              Prefer a personal touch?
            </h2>
            <p className="text-xs sm:text-sm text-[#B9AA99] font-light max-w-lg mx-auto leading-relaxed">
              Reach our confectionery concierges directly on WhatsApp for bespoke orders, urgent party deliveries, and flavor recommendations.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello THALF, I would like to inquire about ordering chocolates.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 inline-flex items-center space-x-2.5 shadow-xl"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
