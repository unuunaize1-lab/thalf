'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function QuickViewModal() {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { quickViewProduct, setQuickViewProduct, addItem } = useCartStore();

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
    setTimeout(() => {
      setAdded(false);
      setQuickViewProduct(null);
    }, 1200);
  };

  const categoryName =
    typeof quickViewProduct.category === 'object'
      ? quickViewProduct.category?.name
      : quickViewProduct.category;

  const genericOriginValues = [
    'Handcrafted with Attention to Detail',
    'Carefully Selected Ingredients',
    'Thoughtfully Presented',
    'Beautifully Presented Signature Box',
  ];
  const hasRealOrigin =
    quickViewProduct.cocoaOrigin && !genericOriginValues.includes(quickViewProduct.cocoaOrigin);

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto selection:bg-[#B88A42] selection:text-[#100805]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#080403]/85 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="min-h-screen px-4 text-center flex items-center justify-center py-12">
        <div className="inline-block w-full max-w-4xl bg-[#140C08] border border-[#B88A42]/30 shadow-2xl overflow-hidden text-left align-middle transition-all transform animate-fade-up relative">

          {/* Close */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-20 p-2.5 bg-[#0B0604]/80 text-[#B9AA99] hover:text-[#B88A42] hover:rotate-90 transition-all duration-300 backdrop-blur-sm border border-[#B88A42]/20"
            aria-label="Close"
            suppressHydrationWarning
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="relative min-h-[350px] md:min-h-[480px] bg-[#0E0704] flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-[#B88A42]/20">
              <Image
                src={quickViewProduct.images[0]?.url || '/images/hero-chocolate.png'}
                alt={quickViewProduct.name}
                fill
                className="object-contain p-4 transition-transform duration-700 hover:scale-105"
              />
              {hasRealOrigin && (
                <div className="absolute bottom-4 left-4 right-4 bg-[#080403]/90 backdrop-blur-md p-3 text-[#F4EBDD] text-[11px] font-mono tracking-wider border border-[#B88A42]/30 flex justify-between items-center">
                  <span>ORIGIN</span>
                  <span className="text-[#B88A42]">{quickViewProduct.cocoaOrigin}</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-8 md:p-10 flex flex-col justify-between space-y-6 bg-[#160E0A]">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {categoryName && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B88A42] border border-[#B88A42]/40 bg-[#0B0604]/60 px-2.5 py-0.5">
                      {categoryName}
                    </span>
                  )}
                </div>

                <h3 className="font-editorial text-3xl sm:text-4xl font-light text-[#F4EBDD] leading-tight">
                  {quickViewProduct.name}
                </h3>

                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl sm:text-3xl font-editorial font-bold text-[#D09A4E]">
                    ₹{Number(quickViewProduct.price).toLocaleString('en-IN')}
                  </span>
                  {quickViewProduct.compareAtPrice && (
                    <span className="text-sm font-mono text-[#B9AA99]/60 line-through">
                      ₹{Number(quickViewProduct.compareAtPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#B9AA99] leading-relaxed font-light">{quickViewProduct.description}</p>

                {/* Tasting Notes */}
                {quickViewProduct.tastingNotes && quickViewProduct.tastingNotes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B88A42] block mb-2">
                      Tasting Notes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickViewProduct.tastingNotes.map((note) => (
                        <span key={note} className="text-[10px] bg-[#211109] text-[#F4EBDD] px-2.5 py-1 border border-[#B88A42]/25 font-medium">
                          ✦ {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flavour Profile */}
                {quickViewProduct.sensoryProfile && (
                  <div className="space-y-2 pt-2 border-t border-[#B88A42]/20">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B88A42] block">Flavour Profile</span>
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      {[
                        { label: 'Intensity', value: quickViewProduct.sensoryProfile.intensity },
                        { label: 'Floral', value: quickViewProduct.sensoryProfile.floral },
                      ].map(({ label, value }) => value !== undefined && (
                        <div key={label}>
                          <div className="flex justify-between text-[#B9AA99] mb-1">
                            <span>{label}</span>
                            <span className="font-mono">{value}/10</span>
                          </div>
                          <div className="w-full h-1 bg-[#211109]">
                            <div className="h-full bg-[#B88A42]" style={{ width: `${value * 10}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add to Bag */}
              <div className="space-y-4 pt-4 border-t border-[#B88A42]/20">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-[#B88A42]/30 bg-[#0B0604]">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="px-3 py-2 text-sm text-[#B9AA99] hover:text-[#F4EBDD] hover:bg-[#211109] transition-colors"
                      suppressHydrationWarning
                    >
                      -
                    </button>
                    <span className="px-4 text-sm font-medium font-mono text-[#F4EBDD]">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)} 
                      className="px-3 py-2 text-sm text-[#B9AA99] hover:text-[#F4EBDD] hover:bg-[#211109] transition-colors"
                      suppressHydrationWarning
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAdd}
                    suppressHydrationWarning
                    className="flex-1 py-3 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    {added ? (
                      <><Check className="w-4 h-4 text-[#100805]" /><span>Added to Bag</span></>
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
