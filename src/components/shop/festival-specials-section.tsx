'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { Product } from '@/types';

interface CollectionWithProducts {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  bannerImage?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  products: Product[];
}

export function FestivalSpecialsSection() {
  const [collections, setCollections] = useState<CollectionWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingState, setAddingState] = useState<Record<string, 'idle' | 'adding' | 'success'>>({});

  const { setQuickViewProduct, addItem, openCart } = useCartStore();

  useEffect(() => {
    let isMounted = true;
    async function loadActiveFestivals() {
      try {
        const res = await fetch('/api/v1/collections/active-festivals');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.collections)) {
          setCollections(data.collections);
        }
      } catch (err) {
        console.warn('[FestivalSpecialsSection] Failed to load active festival collections:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadActiveFestivals();
    return () => { isMounted = false; };
  }, []);

  if (loading || collections.length === 0) {
    return null;
  }

  const handleDirectAddToBag = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingState[product.id] === 'adding') return;

    setAddingState(prev => ({ ...prev, [product.id]: 'adding' }));

    const imageUrl = Array.isArray(product.images) && product.images[0]
      ? typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url
      : '/images/hero-chocolate.png';

    addItem({
      productId: product.id,
      productName: product.name,
      price: Number(product.price),
      quantity: 1,
      image: imageUrl,
      sku: product.sku,
    });

    setTimeout(() => {
      setAddingState(prev => ({ ...prev, [product.id]: 'success' }));
      if (typeof openCart === 'function') openCart();
      setTimeout(() => setAddingState(prev => ({ ...prev, [product.id]: 'idle' })), 1500);
    }, 250);
  };

  return (
    <section className="py-20 bg-dark text-cream relative overflow-hidden border-y border-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {collections.map(col => {
          if (!col.products || col.products.length === 0) return null;

          return (
            <div key={col.id} className="space-y-10">
              {/* Festival Banner Header */}
              <div className="relative rounded-none border border-gold/40 p-8 sm:p-12 bg-cream/5 backdrop-blur-md overflow-hidden">
                {col.bannerImage && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <Image
                      src={col.bannerImage}
                      alt={col.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="relative z-10 space-y-3 max-w-3xl">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gold/20 border border-gold text-gold text-[10px] font-bold uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" />
                    <span>Limited Time Seasonal Festival</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black uppercase tracking-wider text-cream">
                    {col.name}
                  </h2>

                  {col.description && (
                    <p className="text-sm sm:text-base font-sans text-parchment/80 leading-relaxed max-w-2xl">
                      {col.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Festival Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {col.products.map(product => {
                  const imageUrl = Array.isArray(product.images) && product.images[0]
                    ? typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url
                    : '/images/hero-chocolate.png';

                  const stockQty = product.inventory ? product.inventory.stockQuantity - (product.inventory.reservedStock || 0) : 50;
                  const isOutOfStock = stockQty <= 0;
                  const currentState = addingState[product.id] || 'idle';

                  return (
                    <div
                      key={product.id}
                      className="group relative bg-cream/10 border border-gold/20 p-6 flex flex-col justify-between hover:border-gold/60 transition-all duration-300"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gold border border-gold/40 px-2 py-0.5 bg-dark/60">
                            Festival Pack
                          </span>
                          {isOutOfStock && (
                            <span className="text-[9px] font-bold uppercase tracking-widest bg-red-950 text-red-200 border border-red-800 px-2 py-0.5">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <div className="relative w-full aspect-square bg-dark/40 overflow-hidden mb-6">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className={`object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                          />

                          <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3 p-4">
                            <button
                              onClick={() => setQuickViewProduct(product)}
                              className="px-3 py-2 bg-cream text-dark text-[10px] font-bold uppercase tracking-wider hover:bg-gold transition-colors flex items-center space-x-1"
                              title="Quick View"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Details</span>
                            </button>

                            {!isOutOfStock && (
                              <button
                                onClick={(e) => handleDirectAddToBag(product, e)}
                                disabled={currentState !== 'idle'}
                                className="px-3 py-2 bg-gold text-dark text-[10px] font-bold uppercase tracking-wider hover:bg-gold-light transition-colors flex items-center space-x-1"
                              >
                                {currentState === 'adding' ? (
                                  <span>Adding...</span>
                                ) : currentState === 'success' ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-dark" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="h-3.5 w-3.5" />
                                    <span>Add</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="font-serif font-bold text-lg text-cream group-hover:text-gold transition-colors line-clamp-1">
                          {product.name}
                        </h3>

                        <p className="text-xs text-parchment/70 line-clamp-2 mt-1 font-sans">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gold/20 mt-4 flex items-center justify-between">
                        <span className="text-base font-serif font-bold text-gold">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>

                        <Link
                          href={`/shop/${product.slug || product.id}`}
                          className="text-[10px] font-bold uppercase tracking-wider text-parchment hover:text-gold transition-colors"
                        >
                          View Pack →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
