'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Trash2, ArrowRight, MapPin } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
  } = useCartStore();

  const [destination, setDestination] = useState<'kerala' | 'outside'>('kerala');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = destination === 'kerala' ? 80 : 100;
  const totalAmount = subtotal + deliveryFee;

  return (
    <main className="min-h-screen bg-[#100805] text-[#F4EBDD] py-16 px-4 sm:px-6 lg:px-8 selection:bg-[#B88A42] selection:text-[#100805]">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="border-b border-[#B88A42]/20 pb-6 text-center sm:text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A42] block mb-1">
            SHOPPING BAG
          </span>
          <h1 className="text-4xl sm:text-5xl font-editorial font-light text-[#F4EBDD]">Your Selection</h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-[#170B07] border border-[#B88A42]/25 p-16 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#211109] border border-[#B88A42]/30 flex items-center justify-center text-[#B88A42] mx-auto">
              <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
            </div>
            <h2 className="font-editorial text-3xl font-light text-[#F4EBDD]">Your bag is currently empty</h2>
            <p className="text-xs text-[#B9AA99] max-w-sm mx-auto font-light leading-relaxed">
              Explore our artisanal chocolates and bespoke gift collections.
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3.5 bg-[#B88A42] text-[#100805] text-xs uppercase tracking-widest font-semibold hover:bg-[#D09A4E] transition-all shadow-lg"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Delivery Rates Banner */}
              <div className="bg-[#170B07] border border-[#B88A42]/20 p-4 space-y-2 shadow-md text-xs text-[#B9AA99]">
                <div className="flex items-center space-x-2 text-[#F4EBDD] font-medium">
                  <MapPin className="w-4 h-4 text-[#B88A42]" />
                  <span>Express Dispatch Timelines</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="bg-[#100805] p-3 border border-[#B88A42]/20 flex flex-col justify-between">
                    <span className="text-[11px] font-medium text-[#F4EBDD]">Inside Kerala</span>
                    <div className="flex justify-between items-baseline mt-1.5">
                      <strong className="text-[#B88A42] font-mono text-sm">₹80</strong>
                      <span className="text-[10px] text-[#B9AA99] font-medium">3 Days</span>
                    </div>
                  </div>
                  <div className="bg-[#100805] p-3 border border-[#B88A42]/20 flex flex-col justify-between">
                    <span className="text-[11px] font-medium text-[#F4EBDD]">Outside Kerala</span>
                    <div className="flex justify-between items-baseline mt-1.5">
                      <strong className="text-[#B88A42] font-mono text-sm">₹100</strong>
                      <span className="text-[10px] text-[#B9AA99] font-medium">5-6 Days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Cards */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId || 'default'}`}
                    className="flex space-x-4 p-4 border border-[#B88A42]/25 bg-[#170B07] shadow-lg hover:border-[#D09A4E]/50 transition-colors"
                  >
                    <div className="relative w-24 h-24 bg-[#100805] flex-shrink-0 overflow-hidden border border-[#B88A42]/20">
                      <Image
                        src={item.image || '/images/hero-chocolate.png'}
                        alt={item.productName}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-editorial text-lg text-[#F4EBDD] font-light leading-snug">
                            {item.productName}
                          </h3>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="text-[#B9AA99] hover:text-rose-400 p-1 transition-colors"
                            aria-label="Remove item"
                            suppressHydrationWarning
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>
                        {item.variantName && (
                          <p className="text-[10px] text-[#B9AA99] uppercase tracking-wider mt-0.5">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-[#B88A42] mt-1 font-mono">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#B88A42]/15">
                        <div className="flex items-center border border-[#B88A42]/30 bg-[#100805]">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            suppressHydrationWarning
                            className="px-3 py-1 text-xs text-[#B9AA99] hover:text-[#F4EBDD] hover:bg-[#211109] transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-mono font-medium text-[#F4EBDD]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            suppressHydrationWarning
                            className="px-3 py-1 text-xs text-[#B9AA99] hover:text-[#F4EBDD] hover:bg-[#211109] transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-sm font-editorial font-bold text-[#F4EBDD]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-5">
              <div className="bg-[#170B07] border border-[#B88A42]/25 p-6 shadow-2xl space-y-6 sticky top-28">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#B88A42] border-b border-[#B88A42]/20 pb-3">
                  Order Summary
                </h2>

                {/* Delivery Location Selector */}
                <div className="space-y-2.5 bg-[#100805] border border-[#B88A42]/20 p-3.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B9AA99]">Shipping Zone</label>
                    <span className="text-[10px] font-semibold text-[#B88A42]">
                      Est: {destination === 'kerala' ? '3 Days' : '5-6 Days'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDestination('kerala')}
                      suppressHydrationWarning
                      className={`py-2 px-3 text-xs font-semibold transition-all flex flex-col items-center justify-center border ${
                        destination === 'kerala'
                          ? 'bg-[#B88A42] text-[#100805] border-[#B88A42]'
                          : 'bg-[#170B07] text-[#B9AA99] border-[#B88A42]/20 hover:text-[#F4EBDD]'
                      }`}
                    >
                      <span>Kerala (₹80)</span>
                      <span className="text-[9px] opacity-80 font-normal">3 Days Express</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDestination('outside')}
                      suppressHydrationWarning
                      className={`py-2 px-3 text-xs font-semibold transition-all flex flex-col items-center justify-center border ${
                        destination === 'outside'
                          ? 'bg-[#B88A42] text-[#100805] border-[#B88A42]'
                          : 'bg-[#170B07] text-[#B9AA99] border-[#B88A42]/20 hover:text-[#F4EBDD]'
                      }`}
                    >
                      <span>Outside (₹100)</span>
                      <span className="text-[9px] opacity-80 font-normal">5-6 Days Express</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-[#B9AA99]">
                  <div className="flex justify-between">
                    <span>Artisanal Subtotal</span>
                    <span className="text-[#F4EBDD] font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Express Delivery ({destination === 'kerala' ? 'Kerala' : 'Outside Kerala'})</span>
                    <span className="text-[#F4EBDD] font-mono font-semibold">₹{deliveryFee}</span>
                  </div>

                  <div className="flex justify-between text-base font-editorial font-bold text-[#F4EBDD] pt-4 border-t border-[#B88A42]/20">
                    <span>Total Payable</span>
                    <span className="text-[#D09A4E] font-mono text-xl font-bold">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-4 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg block text-center"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[10px] text-center text-[#B9AA99]/80 font-light leading-relaxed">
                  Carefully packed in insulated temperature-controlled pouches for safe arrival.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
