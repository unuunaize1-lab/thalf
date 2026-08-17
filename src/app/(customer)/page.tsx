'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Eye, ShoppingBag, Check, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { Product } from '@/types';

import { FestivalSpecialsSection } from '@/components/shop/festival-specials-section';
import { ClientPhotoGallerySection } from '@/components/shop/client-photo-gallery-section';
import { CustomerReviewsSection } from '@/components/shop/customer-reviews-section';

const DEFAULT_REAL_PRODUCTS: any[] = [
  {
    id: 'default-rock',
    name: 'Rock Chocolate',
    slug: 'rock-chocolate',
    sku: 'THALF-ROCK-70',
    price: 70,
    weight: '4 pcs',
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
    description: 'Handcrafted chocolate pops made with smooth milk chocolate and creamy white chocolate layers.',
    shortDescription: 'Milk chocolate & white chocolate pops (3 pcs)',
    ingredients: 'Milk chocolate, white chocolate',
    tastingNotes: ['Creamy White Chocolate', 'Smooth Milk Chocolate', 'Playful & Sweet'],
    storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
    shelfLife: '3 Months',
    images: [{ url: '/images/choclates/lollypop.jpeg', alt: 'Chocolate Lollypop' }],
    status: 'ACTIVE',
    featured: true,
  },
  {
    id: 'default-kunafa',
    name: 'Kunafa Chocolate',
    slug: 'kunafa-chocolate',
    sku: 'THALF-KUN-70',
    price: 70,
    weight: '25g (Mini bites)',
    description: 'Crispy Middle-Eastern style kunafa pastry and pistachio butter wrapped in luscious milk chocolate. Shipping: ₹80 (Kerala) | ₹100 (Out of Kerala).',
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
    description: 'Decadent milk chocolate bites filled with buttery caramel, roasted cashews, and roasted almonds. Shipping: ₹80 (Kerala) | ₹100 (Out of Kerala).',
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingState, setAddingState] = useState<Record<string, 'idle' | 'adding' | 'success'>>({});

  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  const [heroConfig, setHeroConfig] = useState({
    title: 'Chocolate, crafted differently.',
    subtitle: 'A contemporary expression of chocolate, created for moments worth remembering. Thoughtfully presented, balanced in sweetness, and made to share.',
    buttonText: 'Shop Chocolates',
  });

  const { setQuickViewProduct, addItem, openCart } = useCartStore();

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [prodRes, mktRes] = await Promise.all([
          fetch('/api/v1/products?limit=20').catch(() => null),
          fetch('/api/v1/settings/marketing').catch(() => null),
        ]);
        
        if (prodRes && prodRes.ok) {
          const data = await prodRes.json();
          if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
        }

        if (mktRes && mktRes.ok) {
          const mktData = await mktRes.json();
          if (isMounted && mktData.success && mktData.marketing) {
            setHeroConfig({
              title: mktData.marketing.heroTitle || 'Chocolate, crafted differently.',
              subtitle: mktData.marketing.heroSubtitle || 'A contemporary expression of chocolate, created for moments worth remembering. Thoughtfully presented, balanced in sweetness, and made to share.',
              buttonText: mktData.marketing.heroButtonText || 'Shop Chocolates',
            });
          }
        }
      } catch (err) {
        console.error('HomePage loadData error:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    [bgVideoRef, heroVideoRef].forEach((ref) => {
      if (ref.current) {
        ref.current.defaultMuted = true;
        ref.current.muted = true;
        const playPromise = ref.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Autoplay prevented or delayed:', err);
          });
        }
      }
    });
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

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const featuredSpotlightProduct = products.find((p) => (p as any).isFeatured) || (products.length > 0 ? products[0] : null);

  const renderProductCard = (product: Product, aspectClass = 'aspect-[4/3]') => {
    const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'Artisanal Chocolates');
    const imageUrl =
      Array.isArray(product.images) && product.images[0]
        ? typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url
        : '/images/choclates/rock-chocolate.jpeg';
    const stockQty = product.inventory ? product.inventory.stockQuantity - (product.inventory.reservedStock || 0) : 50;
    const isOutOfStock = stockQty <= 0;
    const currentState = addingState[product.id] || 'idle';
    return (
      <div key={product.id} className="group relative bg-white border border-parchment p-6 flex flex-col justify-between shadow-lux shadow-lux-hover transition-all duration-300 h-full">
        <div>
          <div className="flex justify-between items-center mb-4">
            {categoryName && (
              <span className="text-[9px] font-bold uppercase tracking-ultra text-gold border border-gold/30 px-2.5 py-0.5 bg-cream/80">{categoryName}</span>
            )}
            {isOutOfStock && (
              <span className="text-[9px] font-bold uppercase tracking-ultra bg-red-950 text-red-200 border border-red-800 px-2 py-0.5">Out of Stock</span>
            )}
          </div>
          <div className={`relative w-full ${aspectClass} bg-dark/5 overflow-hidden mb-6`}>
            <Image src={imageUrl} alt={product.name} fill className={`object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`} />
            <button onClick={() => setQuickViewProduct(product)} className="absolute bottom-3 right-3 bg-cream/95 hover:bg-gold text-dark p-2.5 shadow-md backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100" aria-label={`Quick view ${product.name}`}>
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <h3 className="font-editorial text-2xl font-normal text-dark group-hover:text-gold transition-colors">
              <Link href={`/shop/${product.slug || product.id}`}>{product.name}</Link>
            </h3>
            <p className="text-xs text-taupe font-light line-clamp-2 leading-relaxed">{product.description}</p>
            {product.weight && (
              <span className="inline-block text-[10px] font-mono font-semibold text-gold bg-champagne/80 px-2 py-0.5 rounded-sm">
                Pack: {product.weight}
              </span>
            )}
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-parchment flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-editorial font-bold text-dark">₹{Number(product.price).toLocaleString('en-IN')}</span>
            {product.compareAtPrice && <span className="text-xs font-mono text-taupe line-through">₹{Number(product.compareAtPrice).toLocaleString('en-IN')}</span>}
          </div>
          <button
            disabled={isOutOfStock || currentState === 'adding'}
            onClick={(e) => !isOutOfStock && handleDirectAddToBag(product, e)}
            className={`px-5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center space-x-1.5 ${isOutOfStock ? 'bg-parchment text-taupe/60 cursor-not-allowed border border-parchment' : currentState === 'success' ? 'bg-emerald-800 text-white' : currentState === 'adding' ? 'bg-gold/80 text-dark opacity-80' : 'bg-dark text-cream hover:bg-gold hover:text-dark'}`}
          >
            {isOutOfStock ? <span>Out of Stock</span> : currentState === 'adding' ? <span>Adding...</span> : currentState === 'success' ? (<><Check className="w-3.5 h-3.5" /><span>Added ✓</span></>) : (<><ShoppingBag className="w-3.5 h-3.5" /><span>Add to Bag</span></>)}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-cream text-dark">
      {/* HERO */}
      <section className="relative min-h-[88vh] bg-obsidian text-champagne flex items-center overflow-hidden border-b border-gold/20">
        {/* Background ambient video layer (Desktop only) */}
        <div className="hidden md:block absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
          <video
            ref={bgVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/images/choclates/rock-chocolate.jpeg"
            className="w-full h-full object-cover filter blur-[4px] scale-105"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/85 to-obsidian/60" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(197,160,89,0.18),_transparent_65%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8 animate-fade-up">
              <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-light text-cream leading-[1.08] tracking-tight whitespace-pre-line">
                {heroConfig.title}
              </h1>
              <p className="text-sm sm:text-base text-taupe font-light max-w-xl leading-relaxed">
                {heroConfig.subtitle}
              </p>
              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <Link href="#collection" className="px-8 py-4 bg-gold text-dark hover:bg-gold-light text-xs font-semibold uppercase tracking-ultra transition-all duration-300 shadow-lux flex items-center space-x-2.5">
                  <span>{heroConfig.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/about/our-craft" className="px-8 py-4 border border-gold/40 text-champagne hover:border-gold hover:text-gold text-xs font-semibold uppercase tracking-ultra transition-all duration-300 backdrop-blur-sm">
                  Our Craft
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Mobile View: High Quality Chocolate Image Only */}
              <div className="md:hidden relative w-full max-w-md aspect-[4/5] border border-gold/30 p-3 bg-dark/70 backdrop-blur-md shadow-2xl">
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src="/images/choclates/rock-chocolate.jpeg"
                    alt="THALF Artisanal Chocolate"
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/50 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Desktop View: Hero Video */}
              <div className="hidden md:block relative w-full max-w-md aspect-[4/5] border border-gold/30 p-3 bg-dark/70 backdrop-blur-md shadow-2xl group">
                <div className="relative w-full h-full overflow-hidden">
                  <video
                    ref={heroVideoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster="/images/choclates/rock-chocolate.jpeg"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  >
                    <source src="/videos/hero-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section id="collection" className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl border-b border-parchment">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">Our Chocolates</span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-light text-dark">The THALF Collection</h2>
          <p className="text-xs sm:text-sm text-taupe font-light leading-relaxed">A collection made for moments of indulgence and sharing.</p>
        </div>

        <div>
          {products.length <= 3 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {products.map((p) => renderProductCard(p, 'aspect-[4/3]'))}
            </div>
          ) : products.length === 5 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{products.slice(0, 3).map((p) => renderProductCard(p, 'aspect-[4/3]'))}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">{products.slice(3, 5).map((p) => renderProductCard(p, 'aspect-[16/10]'))}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">{products.map((p) => renderProductCard(p, 'aspect-[4/3]'))}</div>
          )}
        </div>

        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/shop" className="inline-flex items-center space-x-2 px-8 py-4 border border-dark text-dark hover:bg-dark hover:text-cream text-xs font-semibold uppercase tracking-ultra transition-all duration-300">
              <span>View All Chocolates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* FEATURED PRODUCT */}
      {featuredSpotlightProduct && (
        <section className="py-24 bg-champagne/40 border-b border-parchment">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 relative aspect-square border border-parchment bg-white p-3 shadow-xl">
                <Image
                  src={Array.isArray(featuredSpotlightProduct.images) && featuredSpotlightProduct.images[0] ? (typeof featuredSpotlightProduct.images[0] === 'string' ? featuredSpotlightProduct.images[0] : featuredSpotlightProduct.images[0].url) : '/images/choclates/rock-chocolate.jpeg'}
                  alt={featuredSpotlightProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="lg:col-span-6 space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">Featured</span>
                <h2 className="font-editorial text-4xl sm:text-5xl font-light text-dark leading-tight">{featuredSpotlightProduct.name}</h2>
                <p className="text-sm sm:text-base text-taupe font-light leading-relaxed">{featuredSpotlightProduct.description}</p>
                {featuredSpotlightProduct.weight && (
                  <span className="inline-block text-xs font-mono font-semibold text-gold bg-cream px-3 py-1 border border-gold/30">
                    Pack Size: {featuredSpotlightProduct.weight}
                  </span>
                )}
                <span className="text-2xl font-editorial font-bold text-dark block">₹{Number(featuredSpotlightProduct.price).toLocaleString('en-IN')}</span>
                <div className="pt-4 flex items-center space-x-4">
                  <button onClick={(e) => handleDirectAddToBag(featuredSpotlightProduct, e)} className="px-8 py-4 bg-dark text-cream hover:bg-gold hover:text-dark text-xs uppercase tracking-ultra font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lux">
                    <ShoppingBag className="w-4 h-4" /><span>Add to Bag</span>
                  </button>
                  <Link href={`/shop/${featuredSpotlightProduct.slug || featuredSpotlightProduct.id}`} className="px-6 py-4 border border-dark text-dark hover:bg-dark hover:text-cream text-xs uppercase tracking-ultra font-semibold transition-all duration-300">
                    View Product
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FESTIVAL SPECIALS SECTION */}
      <FestivalSpecialsSection />

      {/* OUR APPROACH */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl border-b border-parchment">
        <div className="text-center mb-16 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">Our Approach</span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-light text-dark">What makes THALF different</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { n: '01', title: 'Considered', body: 'Formulated with balanced sweetness to highlight true chocolate character.' },
            { n: '02', title: 'Contemporary', body: 'Designed with clean presentation and an elegant aesthetic for modern tastes.' },
            { n: '03', title: 'Made for the Moment', body: 'Crafted so every box arrives ready for sharing.' },
          ].map((p) => (
            <div key={p.n} className="space-y-3 p-6 border border-parchment bg-white/60">
              <span className="text-xs font-mono text-gold block">{p.n}</span>
              <h3 className="font-editorial text-2xl font-normal text-dark">{p.title}</h3>
              <p className="text-xs text-taupe font-light leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REAL CUSTOMER REVIEWS SHOWCASE */}
      <CustomerReviewsSection />

      {/* REAL THALF CLIENT PHOTO GALLERY */}
      <ClientPhotoGallerySection />

      {/* INSTAGRAM */}
      <section className="py-20 bg-champagne/30 border-b border-parchment text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 space-y-5">
          <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">On Instagram</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-light text-dark">@thalf_chococraft</h2>
          <p className="text-xs text-taupe font-light leading-relaxed">Follow us for new flavours and behind-the-scenes.</p>
          <a href="https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDM3ODQ0Nzc0NzA0NDgz?story_media_id=3731029645358965602_77080028562&igsh=MTZvY2JqeGJxam9mZQ==&igsi=MTZvY2JqeGJxam9mZQ==" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 border border-dark text-dark hover:bg-dark hover:text-cream text-xs uppercase tracking-ultra font-semibold transition-all duration-300">
            Follow on Instagram
          </a>
        </div>
      </section>

      {/* WHATSAPP — only shown if configured */}
      {whatsappNumber && (
        <section className="py-20 bg-obsidian text-champagne">
          <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
            <h2 className="font-editorial text-3xl sm:text-5xl font-light text-cream">Prefer a personal touch?</h2>
            <p className="text-sm text-taupe font-light max-w-xl mx-auto leading-relaxed">Reach us directly on WhatsApp for orders and inquiries.</p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello THALF, I would like to inquire about ordering chocolates.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-emerald-800 text-white hover:bg-emerald-700 text-xs font-semibold uppercase tracking-ultra transition-all duration-300 inline-flex items-center space-x-2.5 shadow-lux"
              >
                <MessageCircle className="w-4 h-4" /><span>Order via WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
