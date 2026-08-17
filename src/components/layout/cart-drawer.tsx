'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
  } = useCartStore();

  const [destination, setDestination] = useState<'kerala' | 'outside'>('kerala');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = destination === 'kerala' ? 80 : 100;
  const totalAmount = subtotal + deliveryFee;

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cream border-l border-parchment shadow-2xl flex flex-col justify-between animate-slide-in-right">

          {/* Header */}
          <div className="p-6 border-b border-parchment/60 bg-cream/90 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-5 h-5 text-gold" />
                <h2 className="font-editorial text-2xl font-light tracking-wide text-dark">Your Bag</h2>
                <span className="text-xs font-mono uppercase bg-parchment/80 px-2 py-0.5 text-taupe">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} Items
                </span>
              </div>
              <button onClick={closeCart} className="p-2 text-taupe hover:text-dark hover:rotate-90 transition-all duration-300" aria-label="Close bag">
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-16 h-16 rounded-full bg-parchment/50 flex items-center justify-center text-taupe">
                  <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                </div>
                <h3 className="font-editorial text-2xl font-light text-dark">Your bag is empty</h3>
                <p className="text-xs text-taupe max-w-xs leading-relaxed font-light">
                  Explore our artisanal chocolate collection.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-4 px-6 py-2.5 border border-gold bg-gold text-dark text-xs uppercase tracking-editorial font-medium hover:bg-gold-dark hover:text-white transition-all duration-300"
                >
                  Shop Chocolates
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'default'}`}
                  className="flex space-x-4 p-4 border border-parchment/60 bg-white/40 shadow-sm hover:border-gold/40 transition-colors"
                >
                  <div className="relative w-20 h-20 bg-dark/5 flex-shrink-0 overflow-hidden">
                    <Image src={item.image || '/images/hero-chocolate.png'} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-editorial text-lg text-dark font-medium leading-snug line-clamp-1">{item.productName}</h4>
                      {item.variantName && <p className="text-[10px] text-taupe uppercase tracking-wider mt-0.5">{item.variantName}</p>}
                      <p className="text-xs font-semibold text-gold mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-parchment/30">
                      <div className="flex items-center border border-parchment bg-cream/50">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)} className="px-2 py-0.5 text-xs text-taupe hover:text-dark hover:bg-parchment transition-colors">-</button>
                        <span className="px-2 text-xs font-medium font-mono text-dark">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)} className="px-2 py-0.5 text-xs text-taupe hover:text-dark hover:bg-parchment transition-colors">+</button>
                      </div>
                      <button onClick={() => removeItem(item.productId, item.variantId)} className="text-taupe hover:text-rose-700 transition-colors p-1" aria-label="Remove item">
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-parchment bg-cream/90 backdrop-blur-md space-y-4">
              
              {/* Shipping Destination Toggle */}
              <div className="space-y-1 bg-white/60 border border-parchment p-2.5">
                <span className="text-[10px] uppercase font-bold text-taupe tracking-wider block">Shipping Location</span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setDestination('kerala')}
                    className={`py-1 px-2 text-[11px] font-medium transition-all ${
                      destination === 'kerala'
                        ? 'bg-dark text-gold font-bold border border-dark'
                        : 'bg-cream text-taupe border border-parchment hover:text-dark'
                    }`}
                  >
                    Kerala (₹80)
                  </button>
                  <button
                    onClick={() => setDestination('outside')}
                    className={`py-1 px-2 text-[11px] font-medium transition-all ${
                      destination === 'outside'
                        ? 'bg-dark text-gold font-bold border border-dark'
                        : 'bg-cream text-taupe border border-parchment hover:text-dark'
                    }`}
                  >
                    Outside Kerala (₹100)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-taupe">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-dark font-medium font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="text-dark font-medium font-mono">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-dark pt-2 border-t border-parchment">
                  <span>Total Amount</span>
                  <span className="text-gold-dark font-mono text-base font-bold">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => { closeCart(); window.location.href = '/checkout'; }}
                  className="w-full py-3.5 bg-dark text-cream hover:bg-gold hover:text-dark text-xs uppercase tracking-ultra font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lux"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-taupe font-light">Carefully packaged for safe delivery.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
