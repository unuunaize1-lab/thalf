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
    <div className="fixed inset-0 z-[100] overflow-hidden selection:bg-[#B88A42] selection:text-[#100805]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#080403]/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full max-w-md bg-[#140C08] text-[#F4EBDD] border-l border-[#B88A42]/30 shadow-2xl flex flex-col justify-between animate-slide-in-right h-full">

          {/* Header */}
          <div className="p-6 border-b border-[#B88A42]/20 bg-[#0E0805]/95 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-5 h-5 text-[#B88A42]" />
                <h2 className="font-editorial text-2xl font-light tracking-wide text-[#F4EBDD]">Your Bag</h2>
                <span className="text-xs font-mono uppercase bg-[#211109] border border-[#B88A42]/30 px-2 py-0.5 text-[#B88A42]">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} Items
                </span>
              </div>
              <button 
                onClick={closeCart} 
                className="p-2 text-[#B9AA99] hover:text-[#B88A42] hover:rotate-90 transition-all duration-300" 
                aria-label="Close bag"
                suppressHydrationWarning
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-16 h-16 rounded-full bg-[#211109] border border-[#B88A42]/30 flex items-center justify-center text-[#B88A42]">
                  <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                </div>
                <h3 className="font-editorial text-2xl font-light text-[#F4EBDD]">Your bag is empty</h3>
                <p className="text-xs text-[#B9AA99] max-w-xs leading-relaxed font-light">
                  Explore our artisanal chocolate collection.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-4 px-6 py-2.5 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300"
                >
                  Shop Chocolates
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'default'}`}
                  className="flex space-x-4 p-4 border border-[#B88A42]/25 bg-[#1A0D08] shadow-md hover:border-[#B88A42]/60 transition-colors"
                >
                  <div className="relative w-20 h-20 bg-[#0B0604] border border-[#B88A42]/20 flex-shrink-0 overflow-hidden">
                    <Image src={item.image || '/images/hero-chocolate.png'} alt={item.productName} fill className="object-cover p-1" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-editorial text-lg text-[#F4EBDD] font-medium leading-snug line-clamp-1">{item.productName}</h4>
                      {item.variantName && <p className="text-[10px] text-[#B9AA99] uppercase tracking-wider mt-0.5">{item.variantName}</p>}
                      <p className="text-xs font-semibold text-[#D09A4E] mt-1 font-mono">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#B88A42]/20">
                      <div className="flex items-center border border-[#B88A42]/30 bg-[#0B0604]">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)} 
                          className="px-2 py-0.5 text-xs text-[#B9AA99] hover:text-[#F4EBDD] hover:bg-[#211109] transition-colors"
                          suppressHydrationWarning
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-medium font-mono text-[#F4EBDD]">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)} 
                          className="px-2 py-0.5 text-xs text-[#B9AA99] hover:text-[#F4EBDD] hover:bg-[#211109] transition-colors"
                          suppressHydrationWarning
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.productId, item.variantId)} 
                        className="text-[#B9AA99] hover:text-rose-400 transition-colors p-1" 
                        aria-label="Remove item"
                        suppressHydrationWarning
                      >
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
            <div className="p-6 border-t border-[#B88A42]/20 bg-[#0E0805]/95 backdrop-blur-md space-y-4">
              
              {/* Shipping Destination Toggle */}
              <div className="space-y-1.5 bg-[#0B0604] border border-[#B88A42]/30 p-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-[#B88A42] tracking-wider block">Shipping Location</span>
                  <span className="text-[10px] font-semibold text-[#D09A4E] font-mono">
                    Est. Transit: {destination === 'kerala' ? '1–3 Days' : '3–5 Days'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setDestination('kerala')}
                    suppressHydrationWarning
                    className={`py-2 px-2 text-[11px] font-medium transition-all flex flex-col items-center justify-center ${
                      destination === 'kerala'
                        ? 'bg-[#B88A42] text-[#100805] font-bold shadow-md'
                        : 'bg-[#160C08] text-[#B9AA99] border border-[#B88A42]/20 hover:text-[#F4EBDD]'
                    }`}
                  >
                    <span>Kerala (₹80)</span>
                    <span className="text-[9px] opacity-80 font-mono">1–3 Days</span>
                  </button>
                  <button
                    onClick={() => setDestination('outside')}
                    suppressHydrationWarning
                    className={`py-2 px-2 text-[11px] font-medium transition-all flex flex-col items-center justify-center ${
                      destination === 'outside'
                        ? 'bg-[#B88A42] text-[#100805] font-bold shadow-md'
                        : 'bg-[#160C08] text-[#B9AA99] border border-[#B88A42]/20 hover:text-[#F4EBDD]'
                    }`}
                  >
                    <span>Outside Kerala (₹100)</span>
                    <span className="text-[9px] opacity-80 font-mono">3–5 Days</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#B9AA99]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#F4EBDD] font-medium font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thermal Cold-Chain Courier</span>
                  <span className="text-[#F4EBDD] font-medium font-mono">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#F4EBDD] pt-2 border-t border-[#B88A42]/20">
                  <span>Total Amount</span>
                  <span className="text-[#D09A4E] font-mono text-base font-bold">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => { closeCart(); window.location.href = '/checkout'; }}
                  suppressHydrationWarning
                  className="w-full py-3.5 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </button>
                <p className="text-[10px] text-center text-[#B9AA99]/80 font-light">
                  Protected in thermal insulated cold-pack wrapping. Dispatched Mon–Thu.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
