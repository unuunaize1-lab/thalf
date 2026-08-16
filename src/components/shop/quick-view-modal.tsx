'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!quickViewProduct) return null;

  const handleAdd = () => {
    addItem({
      productId: quickViewProduct.id,
      productName: quickViewProduct.name,
      price: quickViewProduct.price,
      quantity,
      image: quickViewProduct.images[0]?.url || '/images/hero-chocolate.png',
      sku: quickViewProduct.sku,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const categoryName =
    typeof quickViewProduct.category === 'object'
      ? quickViewProduct.category?.name
      : quickViewProduct.category;

  // Only show origin if it's a meaningful value, not a generic fallback
  const genericOriginValues = [
    'Handcrafted with Attention to Detail',
    'Carefully Selected Ingredients',
    'Thoughtfully Presented',
    'Beautifully Presented Signature Box',
  ];
  const hasRealOrigin =
    quickViewProduct.cocoaOrigin && !genericOriginValues.includes(quickViewProduct.cocoaOrigin);

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark/70 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="min-h-screen px-4 text-center flex items-center justify-center py-12">
        <div className="inline-block w-full max-w-4xl bg-cream border border-parchment shadow-2xl overflow-hidden text-left align-middle transition-all transform animate-fade-up relative">

          {/* Close */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-20 p-2.5 bg-cream/80 text-dark hover:text-gold hover:rotate-90 transition-all duration-300 backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="relative min-h-[350px] md:min-h-[480px] bg-dark/5">
              <Image
                src={quickViewProduct.images[0]?.url || '/images/hero-chocolate.png'}
                alt={quickViewProduct.name}
                fill
                className="object-cover"
              />
              {hasRealOrigin && (
                <div className="absolute bottom-4 left-4 right-4 bg-dark/80 backdrop-blur-md p-3 text-cream text-[11px] font-mono tracking-wider border border-gold/30 flex justify-between items-center">
                  <span>ORIGIN</span>
                  <span className="text-gold">{quickViewProduct.cocoaOrigin}</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-8 md:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {categoryName && (
                    <span className="text-[10px] font-bold uppercase tracking-ultra text-gold border border-gold/40 px-2.5 py-0.5">
                      {categoryName}
                    </span>
                  )}
                </div>

                <h3 className="font-editorial text-3xl font-light text-dark leading-tight">
                  {quickViewProduct.name}
                </h3>

                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl font-editorial font-bold text-dark">
                    ₹{Number(quickViewProduct.price).toLocaleString('en-IN')}
                  </span>
                  {quickViewProduct.compareAtPrice && (
                    <span className="text-sm font-mono text-taupe line-through">
                      ₹{Number(quickViewProduct.compareAtPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="text-xs text-taupe leading-relaxed font-light">{quickViewProduct.description}</p>

                {/* Tasting Notes — only if available */}
                {quickViewProduct.tastingNotes && quickViewProduct.tastingNotes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-ultra text-dark block mb-2">
                      Tasting Notes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickViewProduct.tastingNotes.map((note) => (
                        <span key={note} className="text-[10px] bg-champagne text-dark px-2.5 py-1 border border-parchment font-medium">
                          ✦ {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flavour Profile — only if available */}
                {quickViewProduct.sensoryProfile && (
                  <div className="space-y-2 pt-2 border-t border-parchment/60">
                    <span className="text-[10px] font-bold uppercase tracking-ultra text-dark block">Flavour Profile</span>
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      {[
                        { label: 'Intensity', value: quickViewProduct.sensoryProfile.intensity },
                        { label: 'Floral', value: quickViewProduct.sensoryProfile.floral },
                      ].map(({ label, value }) => value !== undefined && (
                        <div key={label}>
                          <div className="flex justify-between text-taupe mb-1">
                            <span>{label}</span>
                            <span className="font-mono">{value}/10</span>
                          </div>
                          <div className="w-full h-1 bg-parchment">
                            <div className="h-full bg-gold" style={{ width: `${value * 10}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add to Bag */}
              <div className="space-y-4 pt-4 border-t border-parchment">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-parchment bg-cream">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-sm text-taupe hover:text-dark hover:bg-parchment transition-colors">-</button>
                    <span className="px-4 text-sm font-medium font-mono text-dark">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-sm text-taupe hover:text-dark hover:bg-parchment transition-colors">+</button>
                  </div>
                  <button
                    onClick={handleAdd}
                    className="flex-1 py-3 bg-dark text-cream hover:bg-gold hover:text-dark text-xs uppercase tracking-ultra font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lux"
                  >
                    {added ? (
                      <><Check className="w-4 h-4 text-emerald-400" /><span>Added to Bag</span></>
                    ) : (
                      <><ShoppingBag className="w-4 h-4" /><span>Add to Bag — ₹{(Number(quickViewProduct.price) * quantity).toLocaleString('en-IN')}</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
