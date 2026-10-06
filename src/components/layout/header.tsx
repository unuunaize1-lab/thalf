'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, User, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcement, setAnnouncement] = useState({
    text: 'Complimentary Express Shipping on Orders Above ₹2,500 | WhatsApp Concierge: +91 90611 07915',
    active: true,
  });

  const { items, openCart } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="bg-[#090503] text-champagne text-[10px] uppercase tracking-ultra py-2 px-4 border-b border-[#B88A42]/20 flex justify-center items-center z-50 relative">
          <span className="font-light text-center leading-snug">
            {announcement.text}
          </span>
        </div>
      )}

      {/* Main Luxury Navigation Header */}
      <header 
        className={`sticky top-0 z-40 w-full border-b transition-all duration-500 ${
          isScrolled 
            ? 'bg-[#080403]/98 backdrop-blur-xl border-[#B88A42]/30 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.9)] py-0' 
            : 'bg-[#0E0805]/90 backdrop-blur-md border-[#B88A42]/20 py-0'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">

            {/* Left: THALF Logo (Enlarged & Seamlessly Blended) */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3.5 group focus:outline-none py-1">
                <div className="relative flex items-center justify-center">
                  {/* Subtle warm amber radial glow for luxury depth */}
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(208,154,78,0.28)_0%,_transparent_72%)] blur-md scale-110 opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-[68px] md:h-[68px] rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                    <Image
                      src="/images/thalf-logo-blend.png"
                      alt="THALF Artisanal Logo"
                      width={70}
                      height={70}
                      priority
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="font-editorial text-2xl md:text-3xl font-light uppercase tracking-[0.25em] text-cream group-hover:text-[#D09A4E] transition-colors duration-300">
                    THALF
                  </span>
                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.38em] text-[#B88A42] font-sans -mt-0.5">
                    CHOCOLATES
                  </span>
                </div>
              </Link>
            </div>

            {/* Center/Right Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-9">
              <Link 
                href="/shop" 
                className="group text-xs font-semibold uppercase tracking-[0.25em] text-cream hover:text-gold transition-colors relative py-1"
              >
                Shop
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>

              <Link 
                href="/about/our-craft" 
                className="group text-xs font-semibold uppercase tracking-[0.25em] text-cream hover:text-gold transition-colors relative py-1"
              >
                Our Story
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>

              <Link 
                href="/hampers" 
                className="group text-xs font-semibold uppercase tracking-[0.25em] text-cream hover:text-gold transition-colors relative py-1"
              >
                Gifts
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>

              <Link 
                href="/#collection" 
                className="group text-xs font-semibold uppercase tracking-[0.25em] text-cream hover:text-gold transition-colors relative py-1"
              >
                Collections
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>

              <a 
                href="https://wa.me/919061107915" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group text-xs font-semibold uppercase tracking-[0.25em] text-cream hover:text-gold transition-colors relative py-1"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </nav>

            {/* Right Action Icons & Mobile Hamburger */}
            <div className="flex items-center space-x-2 sm:space-x-5">
              
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-cream hover:text-gold transition-colors focus:outline-none"
                aria-label="Search"
                suppressHydrationWarning
              >
                <Search className="h-5 w-5 stroke-[1.5]" />
              </button>

              {/* Account Link */}
              <Link
                href="/profile/dashboard"
                className="p-2 text-cream hover:text-gold transition-colors hidden sm:block focus:outline-none"
                aria-label="Account"
                suppressHydrationWarning
              >
                <User className="h-5 w-5 stroke-[1.5]" />
              </Link>

              {/* Shopping Bag Button with Badge */}
              <button
                onClick={openCart}
                className="relative p-2 text-cream hover:text-gold transition-colors flex items-center group focus:outline-none"
                aria-label="Shopping Bag"
                suppressHydrationWarning
              >
                <div className="relative">
                  <ShoppingBag className="h-5 w-5 stroke-[1.5] group-hover:scale-105 transition-transform" />
                  <span className="absolute -top-1.5 -right-2 bg-gold text-[#120B07] text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {totalItemCount}
                  </span>
                </div>
              </button>

              {/* Mobile Menu Button */}
              <div className="flex lg:hidden ml-1">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-cream hover:text-gold transition-colors focus:outline-none"
                  aria-label="Toggle menu"
                  suppressHydrationWarning
                >
                  {mobileMenuOpen ? <X className="h-6 w-6 stroke-[1.5]" /> : <Menu className="h-6 w-6 stroke-[1.5]" />}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Search Drawer */}
        {searchOpen && (
          <div className="border-t border-gold/20 bg-[#160d08] p-4 animate-fade-down shadow-2xl">
            <div className="max-w-2xl mx-auto flex items-center space-x-3 bg-[#090503] border border-gold/40 px-4 py-2.5">
              <Search className="w-4 h-4 text-gold flex-shrink-0" />
              <input
                type="text"
                placeholder="Search dark chocolates, truffles, hampers..."
                className="w-full bg-transparent text-xs text-cream placeholder:text-taupe focus:outline-none font-sans"
                autoFocus
              />
              <button 
                onClick={() => setSearchOpen(false)} 
                className="text-[10px] uppercase font-bold tracking-widest text-taupe hover:text-gold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gold/20 bg-[#0e0805]/98 h-screen p-8 animate-fade-in flex flex-col justify-between">
            <div className="space-y-6 pt-4 text-center">
              <Link 
                href="/shop" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block font-editorial text-2xl uppercase tracking-[0.25em] text-cream hover:text-gold transition-colors"
              >
                Shop
              </Link>
              <Link 
                href="/about/our-craft" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block font-editorial text-2xl uppercase tracking-[0.25em] text-cream hover:text-gold transition-colors"
              >
                Our Story
              </Link>
              <Link 
                href="/hampers" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block font-editorial text-2xl uppercase tracking-[0.25em] text-gold hover:text-gold-light transition-colors"
              >
                Gifts 🎁
              </Link>
              <Link 
                href="/#collection" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block font-editorial text-2xl uppercase tracking-[0.25em] text-cream hover:text-gold transition-colors"
              >
                Collections
              </Link>
              <a 
                href="https://wa.me/919061107915" 
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)} 
                className="block font-editorial text-2xl uppercase tracking-[0.25em] text-cream hover:text-gold transition-colors"
              >
                Contact
              </a>
              <Link 
                href="/profile/dashboard" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block font-editorial text-xl uppercase tracking-[0.2em] text-taupe hover:text-gold transition-colors pt-2"
              >
                My Account
              </Link>
            </div>

            <div className="pb-24 text-center space-y-3 border-t border-[#B88A42]/20 pt-6 flex flex-col items-center">
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shadow-xl">
                <Image
                  src="/images/thalf-logo-blend.png"
                  alt="THALF Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#B88A42] font-bold">THALF CHOCOLATES</p>
              <p className="text-xs text-[#B9AA99] font-light">A Little Dark. A Lot of THALF.</p>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
