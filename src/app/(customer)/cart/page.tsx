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
    <main className="min-h-screen bg-cream text-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-parchment pb-6 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-editorial font-light text-dark">Your Bag</h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-cream border border-parchment p-12 text-center space-y-6 shadow-lux">
            <div className="w-20 h-20 rounded-full bg-parchment/50 flex items-center justify-center text-taupe mx-auto">
              <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
            </div>
            <h2 className="font-editorial text-2xl font-light text-dark">Your bag is currently empty</h2>
            <p className="text-xs text-taupe max-w-sm mx-auto font-light leading-relaxed">
              Explore our artisanal chocolate collection.
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-gold text-dark text-xs uppercase tracking-ultra font-semibold hover:bg-gold-dark hover:text-white transition-all shadow-md"
            >
              Shop Chocolates
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Delivery Rates Banner */}
              <div className="bg-cream border border-parchment p-4 space-y-2 shadow-sm text-xs text-taupe">
                <div className="flex items-center space-x-2 text-dark font-semibold">
                  <MapPin className="w-4 h-4 text-gold" />
                  <span>Delivery Charges Notice</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="bg-white p-2.5 border border-parchment flex justify-between items-center">
                    <span>Inside Kerala</span>
                    <strong className="text-dark font-mono">₹80</strong>
                  </div>
                  <div className="bg-white p-2.5 border border-parchment flex justify-between items-center">
                    <span>Outside Kerala</span>
                    <strong className="text-dark font-mono">₹100</strong>
                  </div>
                </div>
              </div>

              {/* Item Cards */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId || 'default'}`}
                    className="flex space-x-4 p-4 border border-parchment bg-white/60 shadow-sm hover:border-gold/50 transition-colors"
                  >
                    <div className="relative w-24 h-24 bg-dark/5 flex-shrink-0 overflow-hidden border border-parchment">
                      <Image
                        src={item.image || '/images/hero-chocolate.png'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-editorial text-lg text-dark font-medium leading-snug">
                            {item.productName}
                          </h3>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="text-taupe hover:text-rose-700 p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>
                        {item.variantName && (
                          <p className="text-[10px] text-taupe uppercase tracking-wider mt-0.5">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-gold mt-1">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-parchment/40">
                        <div className="flex items-center border border-parchment rounded bg-cream/80">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            className="px-2.5 py-1 text-xs text-taupe hover:text-dark hover:bg-parchment transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-mono font-medium text-dark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            className="px-2.5 py-1 text-xs text-taupe hover:text-dark hover:bg-parchment transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-serif font-bold text-dark">
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
              <div className="bg-cream border border-parchment p-6 shadow-lux space-y-6 sticky top-8">
                <h2 className="text-xs font-bold uppercase tracking-wider text-dark border-b border-parchment pb-3">
                  Order Summary
                </h2>

                {/* Delivery Location Selector */}
                <div className="space-y-2 bg-white/60 border border-parchment p-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-taupe">Select Shipping Location</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDestination('kerala')}
                      className={`py-2 px-3 text-xs font-semibold transition-all ${
                        destination === 'kerala'
                          ? 'bg-dark text-gold border border-dark'
                          : 'bg-cream text-taupe border border-parchment hover:text-dark'
                      }`}
                    >
                      Kerala (₹80)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDestination('outside')}
                      className={`py-2 px-3 text-xs font-semibold transition-all ${
                        destination === 'outside'
                          ? 'bg-dark text-gold border border-dark'
                          : 'bg-cream text-taupe border border-parchment hover:text-dark'
                      }`}
                    >
                      Outside Kerala (₹100)
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-taupe">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-dark font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Charge ({destination === 'kerala' ? 'Kerala' : 'Outside Kerala'})</span>
                    <span className="text-dark font-mono font-semibold">₹{deliveryFee}</span>
                  </div>

                  <div className="flex justify-between text-sm font-serif font-bold text-dark pt-3 border-t border-parchment">
                    <span>Total Payable</span>
                    <span className="text-gold-dark font-mono text-xl font-bold">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-4 bg-dark text-cream hover:bg-gold hover:text-dark text-xs uppercase tracking-ultra font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lux block text-center"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[10px] text-center text-taupe font-light leading-relaxed">
                  Carefully packaged for safe delivery.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
