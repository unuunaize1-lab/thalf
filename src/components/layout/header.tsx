'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, User, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [announcement, setAnnouncement] = useState({
    text: 'Complimentary Express Shipping on Orders Above ₹2,500 | WhatsApp Order Support: +91 90611 07915',
    active: true,
  });

  const { items, openCart } = useCartStore();

  useEffect(() => {
    async function loadAnnouncement() {
      try {
        const res = await fetch('/api/v1/settings/marketing');
        const data = await res.json();
        if (data.success && data.marketing) {
          setAnnouncement({
            text: data.marketing.announcementText || 'Complimentary Express Shipping on Orders Above ₹2,500',
            active: data.marketing.announcementActive !== false,
          });
        }
      } catch {
        // Fallback silently
      }
    }
    loadAnnouncement();
  }, []);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Announcement Bar */}
      {announcement.active && (
        <div className="bg-obsidian text-champagne text-[10px] uppercase tracking-ultra py-2 px-4 border-b border-gold/20 flex justify-center items-center z-50 relative">
          <span className="font-light text-center leading-snug">
            {announcement.text}
          </span>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-parchment/60 bg-cream/95 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">

            {/* Left Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/shop" className="group text-xs font-semibold uppercase tracking-ultra text-dark hover:text-gold transition-colors relative py-1">
                Shop
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/about/our-craft" className="group text-xs font-semibold uppercase tracking-ultra text-dark hover:text-gold transition-colors relative py-1">
                Our Craft
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-dark hover:text-gold transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6 stroke-[1.5]" /> : <Menu className="h-6 w-6 stroke-[1.5]" />}
              </button>
            </div>

            {/* Centered Brand Mark with Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <Image
                  src="/favicon.png"
                  alt="THALF Logo"
                  width={40}
                  height={40}
                  priority
                  className="w-10 h-10 object-contain rounded-full border border-gold/40 shadow-sm"
                />
                <div className="flex flex-col">
                  <span className="font-editorial text-2xl md:text-3xl font-light uppercase tracking-[0.25em] text-dark group-hover:text-gold transition-colors duration-300">
                    THALF
                  </span>
                  <span className="text-[7.5px] font-bold uppercase tracking-[0.35em] text-gold font-sans -mt-0.5">
                    Handcrafted Chocolate
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-5">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-dark hover:text-gold transition-colors"
                aria-label="Search"
                suppressHydrationWarning
              >
                <Search className="h-5 w-5 stroke-[1.5]" />
              </button>

              <Link
                href="/profile/dashboard"
                className="p-2 text-dark hover:text-gold transition-colors hidden sm:block"
                aria-label="Account"
                suppressHydrationWarning
              >
                <User className="h-5 w-5 stroke-[1.5]" />
              </Link>

              <button
                onClick={openCart}
                className="relative p-2 text-dark hover:text-gold transition-colors flex items-center group"
                aria-label="Shopping Bag"
                suppressHydrationWarning
              >
                <ShoppingBag className="h-5 w-5 stroke-[1.5] group-hover:scale-105 transition-transform" />
                <span className="ml-1.5 text-xs font-mono font-medium text-dark group-hover:text-gold">
                  ({totalItemCount})
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* Search Drawer */}
        {searchOpen && (
          <div className="border-t border-parchment bg-champagne p-4 animate-fade-down shadow-lg">
            <div className="max-w-2xl mx-auto flex items-center space-x-3 bg-cream border border-gold/40 px-4 py-2">
              <Search className="w-4 h-4 text-gold" />
              <input
                type="text"
                placeholder="Search chocolates..."
                className="w-full bg-transparent text-xs text-dark placeholder:text-taupe focus:outline-none font-sans"
                autoFocus
              />
              <button onClick={() => setSearchOpen(false)} className="text-xs uppercase text-taupe hover:text-dark">
                Close
              </button>
            </div>
          </div>
        )}

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-parchment bg-cream/98 h-screen p-8 animate-fade-in flex flex-col justify-between">
            <div className="space-y-6 pt-4 text-center">
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block font-editorial text-2xl uppercase tracking-ultra text-dark hover:text-gold">
                Shop
              </Link>
              <Link href="/about/our-craft" onClick={() => setMobileMenuOpen(false)} className="block font-editorial text-2xl uppercase tracking-ultra text-dark hover:text-gold">
                Our Craft
              </Link>
              <Link href="/profile/dashboard" onClick={() => setMobileMenuOpen(false)} className="block font-editorial text-2xl uppercase tracking-ultra text-dark hover:text-gold">
                Account
              </Link>
            </div>
            <div className="pb-24 text-center space-y-3 border-t border-parchment pt-6 flex flex-col items-center">
              <Image
                src="/favicon.png"
                alt="THALF Logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain rounded-full border border-gold/40"
              />
              <p className="text-[10px] uppercase tracking-ultra text-gold font-bold">THALF</p>
              <p className="text-xs text-taupe font-light">Handcrafted Chocolate. Thoughtfully Presented.</p>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
