'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, ShoppingBag, Grid, List, Check, MessageSquare } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { Product } from '@/types';
import QuoteRequestModal from '@/components/hampers/QuoteRequestModal';
import { FestivalSpecialsSection } from '@/components/shop/festival-specials-section';

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

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_REAL_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { setQuickViewProduct, addItem } = useCartStore();
  const [addedId, setAddedId] = useState<string | null>(null);

  // Quote Request Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedQuoteProduct, setSelectedQuoteProduct] = useState<any>(null);

  const handleOpenQuoteModal = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedQuoteProduct(product);
    setQuoteModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadShopProducts() {
      try {
        const res = await fetch('/api/v1/products?limit=50').catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error('ShopPage load error:', err);
      }
    }
    loadShopProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Derive real categories from actual loaded products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      const cat = typeof p.category === 'object' ? p.category?.name : p.category;
      if (cat) cats.add(cat);
    });
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
        const matchCategory = selectedCategory === 'All' || categoryName === selectedCategory;
        const query = searchQuery.toLowerCase().trim();
        const matchSearch =
          !query ||
          product.name.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query)) ||
          (product.sku && product.sku.toLowerCase().includes(query));
        return matchCategory && matchSearch;
      })
      .sort((a, b) => {
        const priceA = Number(a.price);
        const priceB = Number(b.price);
        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const imageUrl =
      Array.isArray(product.images) && product.images[0]
        ? typeof product.images[0] === 'string'
          ? product.images[0]
          : product.images[0].url
        : '/images/choclates/rock-chocolate.jpeg';
    addItem({ productId: product.id, productName: product.name, price: Number(product.price), quantity: 1, image: imageUrl, sku: product.sku });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="bg-[#100805] text-[#F4EBDD] min-h-screen pb-24 selection:bg-[#B88A42] selection:text-[#100805]" suppressHydrationWarning>
      {/* Shop Hero */}
      <div className="bg-[#0B0604] text-[#F4EBDD] border-b border-[#B88A42]/20 py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(184,138,66,0.12),_transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#B88A42] block">
            ARTISANAL CATALOGUE
          </span>
          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-[#F4EBDD]">All Chocolates</h1>
          <p className="text-xs sm:text-sm text-[#B9AA99] font-light max-w-lg mx-auto leading-relaxed">
            Handcrafted chocolates for sharing and everyday indulgence.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="sticky top-20 z-30 bg-[#0E0805]/95 backdrop-blur-md border-b border-[#B88A42]/20 py-4 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Search + Category Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder="Search chocolates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#160C08] border border-[#B88A42]/30 px-3 py-1.5 text-xs text-[#F4EBDD] placeholder:text-[#B9AA99]/60 focus:border-[#B88A42] outline-none font-sans"
                suppressHydrationWarning
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1.5 text-xs text-[#B9AA99] hover:text-[#F4EBDD]">✕</button>
              )}
            </div>

            {/* Category pills */}
            {categories.length > 2 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    suppressHydrationWarning
                    className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#B88A42] text-[#100805] font-bold shadow-md'
                        : 'bg-[#1A0D08] border border-[#B88A42]/25 text-[#B9AA99] hover:text-[#F4EBDD] hover:border-[#B88A42]/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Sort + View Mode */}
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#160C08] border border-[#B88A42]/30 px-2 py-1 text-xs text-[#F4EBDD] focus:border-[#B88A42] outline-none font-mono"
              suppressHydrationWarning
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <div className="hidden sm:flex border border-[#B88A42]/30 bg-[#160C08]">
              <button
                onClick={() => setViewMode('grid')}
                suppressHydrationWarning
                className={`p-1.5 ${viewMode === 'grid' ? 'bg-[#B88A42] text-[#100805]' : 'text-[#B9AA99] hover:text-[#F4EBDD]'}`}
                aria-label="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                suppressHydrationWarning
                className={`p-1.5 ${viewMode === 'list' ? 'bg-[#B88A42] text-[#100805]' : 'text-[#B9AA99] hover:text-[#F4EBDD]'}`}
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Festival Specials Section */}
        <FestivalSpecialsSection />
      </div>

      {/* Products */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex justify-between items-center text-xs text-[#B9AA99]">
          <span>Showing <strong className="text-[#F4EBDD] font-mono">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'chocolate' : 'chocolates'}</span>
          {(selectedCategory !== 'All' || searchQuery !== '') && (
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="text-[#B88A42] underline hover:text-[#F4EBDD]"
              suppressHydrationWarning
            >
              Reset filters
            </button>
          )}
        </div>

        {error ? (
          <div className="py-16 text-center border border-red-900/40 bg-red-950/20 p-8 my-8">
            <h3 className="font-editorial text-2xl text-red-200 mb-2">Something went wrong</h3>
            <p className="text-xs text-red-300 max-w-md mx-auto font-light leading-relaxed mb-4">{error}</p>
          </div>
        ) : loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#B9AA99]">Loading chocolates...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center border border-[#B88A42]/20 bg-[#160C08] p-8 my-8">
            <h3 className="font-editorial text-2xl text-[#F4EBDD] mb-2">No Chocolates Match Your Search</h3>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-6 py-2.5 bg-[#B88A42] text-[#100805] text-xs uppercase tracking-wider font-semibold hover:bg-[#D09A4E] transition-colors"
              suppressHydrationWarning
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'ARTISANAL CHOCOLATES');
              const imageUrl =
                Array.isArray(product.images) && product.images[0]
                  ? typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url
                  : '/images/choclates/rock-chocolate.jpeg';
              const stockQty = product.inventory ? product.inventory.stockQuantity - (product.inventory.reservedStock || 0) : 50;
              const isOutOfStock = stockQty <= 0;
              return (
                <div key={product.id} className="group relative bg-[#1A0D08] border border-[#B88A42]/22 hover:border-[#B88A42]/60 p-6 sm:p-7 flex flex-col justify-between transition-all duration-500 ease-out hover:shadow-[0_20px_50px_-15px_rgba(208,154,78,0.18)] hover:-translate-y-1">
                  <div>
                    <div className="flex justify-between items-center mb-4 z-10">
                      {categoryName && (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#B88A42] border border-[#B88A42]/30 px-2 py-0.5 bg-[#0B0604]">{categoryName}</span>
                      )}
                      {isOutOfStock && (
                        <span className="text-[9px] font-mono uppercase tracking-widest bg-red-950 text-red-200 border border-red-800 px-2 py-0.5">Out of Stock</span>
                      )}
                    </div>
                    <div className="relative w-full aspect-[4/3] bg-[#120704] border border-[#B88A42]/15 overflow-hidden mb-6 flex items-center justify-center p-3 shadow-inner">
                      <Image src={imageUrl} alt={product.name} fill className={`object-contain p-2 group-hover:scale-105 transition-transform duration-700 ease-out ${isOutOfStock ? 'grayscale opacity-75' : ''}`} />
                      <button 
                        onClick={() => setQuickViewProduct(product)} 
                        className="absolute bottom-3 right-3 bg-[#0B0604]/80 text-[#B9AA99] hover:text-[#B88A42] p-2.5 shadow-md backdrop-blur-sm border border-[#B88A42]/30 transition-all duration-300 opacity-0 group-hover:opacity-100" 
                        aria-label={`Quick view ${product.name}`}
                        suppressHydrationWarning
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="font-editorial text-2xl font-light text-[#F4EBDD] group-hover:text-[#D09A4E] transition-colors">
                        <Link href={`/shop/${product.slug || product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="text-xs text-[#B9AA99] font-light line-clamp-2 leading-relaxed">{product.description}</p>
                      {product.weight && (
                        <span className="inline-block text-[10px] font-mono font-semibold text-[#B88A42] bg-[#B88A42]/10 border border-[#B88A42]/20 px-2 py-0.5 rounded-sm">
                          Pack: {product.weight}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 pt-4 border-t border-[#B88A42]/20 flex items-center justify-between">
                    <span className="text-xl font-editorial font-bold text-[#D09A4E]">₹{Number(product.price).toLocaleString('en-IN')}</span>

                    <button
                      disabled={isOutOfStock}
                      onClick={(e) => !isOutOfStock && handleQuickAdd(product, e)}
                      suppressHydrationWarning
                      className={`px-5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center space-x-1.5 ${
                        isOutOfStock 
                          ? 'bg-[#211109] text-[#B9AA99]/50 cursor-not-allowed border border-[#B88A42]/20' 
                          : addedId === product.id 
                          ? 'bg-emerald-900 text-white border border-emerald-500' 
                          : 'bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E]'
                      }`}
                    >
                      {isOutOfStock ? <span>Out of Stock</span> : addedId === product.id ? (<><Check className="w-3.5 h-3.5" /><span>Added</span></>) : (<><ShoppingBag className="w-3.5 h-3.5" /><span>Add to Bag</span></>)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'ARTISANAL CHOCOLATES');
              const imageUrl =
                Array.isArray(product.images) && product.images[0]
                  ? typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url
                  : '/images/choclates/rock-chocolate.jpeg';
              const stockQty = product.inventory ? product.inventory.stockQuantity - (product.inventory.reservedStock || 0) : 50;
              const isOutOfStock = stockQty <= 0;
              return (
                <div key={product.id} className="bg-[#1A0D08] border border-[#B88A42]/25 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md hover:border-[#B88A42]/60 transition-colors">
                  <div className="flex items-center space-x-6">
                    <div className="relative w-28 h-28 bg-[#120704] border border-[#B88A42]/20 flex-shrink-0 overflow-hidden flex items-center justify-center p-2">
                      <Image src={imageUrl} alt={product.name} fill className={`object-contain p-1 ${isOutOfStock ? 'grayscale opacity-75' : ''}`} />
                    </div>
                    <div className="space-y-1">
                      {categoryName && <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#B88A42]">{categoryName}</span>}
                      {isOutOfStock && <span className="text-[9px] font-mono uppercase tracking-widest bg-red-950 text-red-200 px-2 py-0.5 ml-2 border border-red-800">Out of Stock</span>}
                      <h3 className="font-editorial text-2xl font-light text-[#F4EBDD] hover:text-[#D09A4E] transition-colors">
                        <Link href={`/shop/${product.slug || product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="text-xs text-[#B9AA99] font-light max-w-xl line-clamp-1">{product.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end space-x-6 pt-4 md:pt-0 border-t md:border-t-0 border-[#B88A42]/20">
                    <span className="text-2xl font-editorial font-bold text-[#D09A4E]">₹{Number(product.price).toLocaleString('en-IN')}</span>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setQuickViewProduct(product)} 
                        className="p-2.5 border border-[#B88A42]/30 hover:border-[#B88A42] text-[#B9AA99] hover:text-[#F4EBDD]" 
                        aria-label={`Quick view ${product.name}`}
                        suppressHydrationWarning
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        disabled={isOutOfStock}
                        onClick={(e) => !isOutOfStock && handleQuickAdd(product, e)}
                        suppressHydrationWarning
                        className={`px-6 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${isOutOfStock ? 'bg-[#211109] text-[#B9AA99]/50 cursor-not-allowed border border-[#B88A42]/20' : 'bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E]'}`}
                      >
                        {isOutOfStock ? <span>Out of Stock</span> : addedId === product.id ? <span>Added ✓</span> : <span>Add to Bag</span>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <QuoteRequestModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        product={selectedQuoteProduct}
      />
    </div>
  );
}
