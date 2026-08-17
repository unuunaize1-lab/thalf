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
    <div className="bg-cream text-dark min-h-screen pb-24">
      {/* Shop Hero */}
      <div className="bg-obsidian text-champagne border-b border-gold/20 py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(197,160,89,0.12),_transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-cream">Shop</h1>
          <p className="text-xs sm:text-sm text-taupe font-light max-w-lg mx-auto leading-relaxed">
            Handcrafted chocolates for sharing and everyday indulgence.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="sticky top-20 z-30 bg-cream/95 backdrop-blur-md border-b border-parchment py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Search + Category Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder="Search chocolates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cream border border-parchment px-3 py-1.5 text-xs text-dark placeholder:text-taupe/60 focus:border-gold outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1.5 text-xs text-taupe hover:text-dark">✕</button>
              )}
            </div>

            {/* Category pills */}
            {categories.length > 2 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-dark text-cream border border-dark'
                        : 'bg-champagne/60 border border-parchment text-taupe hover:text-dark hover:border-gold'
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
              className="bg-cream border border-parchment px-2 py-1 text-xs text-dark focus:border-gold outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <div className="hidden sm:flex border border-parchment bg-cream">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 ${viewMode === 'grid' ? 'bg-dark text-gold' : 'text-taupe hover:text-dark'}`}
                aria-label="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 ${viewMode === 'list' ? 'bg-dark text-gold' : 'text-taupe hover:text-dark'}`}
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
        <div className="mb-6 flex justify-between items-center text-xs text-taupe">
          <span>Showing <strong className="text-dark font-mono">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'chocolate' : 'chocolates'}</span>
          {(selectedCategory !== 'All' || searchQuery !== '') && (
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="text-gold underline hover:text-dark"
            >
              Reset filters
            </button>
          )}
        </div>

        {error ? (
          <div className="py-16 text-center border border-red-200 bg-red-50 p-8 my-8">
            <h3 className="font-editorial text-2xl text-red-900 mb-2">Something went wrong</h3>
            <p className="text-xs text-red-800 max-w-md mx-auto font-light leading-relaxed mb-4">{error}</p>
          </div>
        ) : loading ? (
          <div className="py-16 text-center text-xs font-mono text-dark/50">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center border border-parchment/60 bg-cream/50 p-8 my-8">
            <h3 className="font-editorial text-2xl text-dark mb-2">No Chocolates Match Your Search</h3>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-6 py-2.5 bg-dark text-cream text-xs uppercase tracking-wider font-semibold hover:bg-gold hover:text-dark transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'Artisanal Chocolates');
              const imageUrl =
                Array.isArray(product.images) && product.images[0]
                  ? typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url
                  : '/images/choclates/rock-chocolate.jpeg';
              const stockQty = product.inventory ? product.inventory.stockQuantity - (product.inventory.reservedStock || 0) : 50;
              const isOutOfStock = stockQty <= 0;
              return (
                <div key={product.id} className="group relative bg-white/70 border border-parchment/70 p-6 flex flex-col justify-between shadow-lux shadow-lux-hover transition-all duration-300">
                  <div className="flex justify-between items-center mb-4 z-10">
                    {categoryName && (
                      <span className="text-[9px] font-bold uppercase tracking-ultra text-gold border border-gold/30 px-2 py-0.5 bg-cream">{categoryName}</span>
                    )}
                    {isOutOfStock && (
                      <span className="text-[9px] font-bold uppercase tracking-ultra bg-red-950 text-red-200 border border-red-800 px-2 py-0.5">Out of Stock</span>
                    )}
                  </div>
                  <div className="relative w-full aspect-[4/3] bg-dark/5 overflow-hidden mb-6">
                    <Image src={imageUrl} alt={product.name} fill className={`object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${isOutOfStock ? 'grayscale opacity-75' : ''}`} />
                    <button onClick={() => setQuickViewProduct(product)} className="absolute bottom-3 right-3 bg-cream/95 hover:bg-gold text-dark p-2.5 shadow-md backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100" aria-label={`Quick view ${product.name}`}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 flex-1">
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
                  <div className="mt-8 pt-4 border-t border-parchment/60 flex items-center justify-between">
                    <span className="text-lg font-editorial font-bold text-dark">₹{Number(product.price).toLocaleString('en-IN')}</span>

                    <button
                      disabled={isOutOfStock}
                      onClick={(e) => !isOutOfStock && handleQuickAdd(product, e)}
                      className={`px-5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center space-x-1.5 ${isOutOfStock ? 'bg-parchment text-taupe/60 cursor-not-allowed border border-parchment' : addedId === product.id ? 'bg-emerald-800 text-white' : 'bg-dark text-cream hover:bg-gold hover:text-dark'}`}
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
              const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'Artisanal Chocolates');
              const imageUrl =
                Array.isArray(product.images) && product.images[0]
                  ? typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url
                  : '/images/choclates/rock-chocolate.jpeg';
              const stockQty = product.inventory ? product.inventory.stockQuantity - (product.inventory.reservedStock || 0) : 50;
              const isOutOfStock = stockQty <= 0;
              return (
                <div key={product.id} className="bg-white/70 border border-parchment p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:border-gold/50 transition-colors">
                  <div className="flex items-center space-x-6">
                    <div className="relative w-28 h-28 bg-dark/5 flex-shrink-0 overflow-hidden">
                      <Image src={imageUrl} alt={product.name} fill className={`object-cover ${isOutOfStock ? 'grayscale opacity-75' : ''}`} />
                    </div>
                    <div className="space-y-1">
                      {categoryName && <span className="text-[9px] font-bold uppercase tracking-ultra text-gold">{categoryName}</span>}
                      {isOutOfStock && <span className="text-[9px] font-bold uppercase tracking-ultra bg-red-950 text-red-200 px-2 py-0.5 ml-2">Out of Stock</span>}
                      <h3 className="font-editorial text-2xl font-normal text-dark hover:text-gold transition-colors">
                        <Link href={`/shop/${product.slug || product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="text-xs text-taupe font-light max-w-xl line-clamp-1">{product.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end space-x-6 pt-4 md:pt-0 border-t md:border-t-0 border-parchment">
                    <span className="text-xl font-editorial font-bold text-dark">₹{Number(product.price).toLocaleString('en-IN')}</span>

                    <div className="flex space-x-2">
                      <button onClick={() => setQuickViewProduct(product)} className="p-2.5 border border-parchment hover:border-gold text-taupe hover:text-dark" aria-label={`Quick view ${product.name}`}>
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        disabled={isOutOfStock}
                        onClick={(e) => !isOutOfStock && handleQuickAdd(product, e)}
                        className={`px-6 py-2.5 text-xs uppercase tracking-ultra font-semibold transition-all duration-300 ${isOutOfStock ? 'bg-parchment text-taupe/60 cursor-not-allowed' : 'bg-dark text-cream hover:bg-gold hover:text-dark'}`}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
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
