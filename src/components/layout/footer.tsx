'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080403] text-[#F4EBDD] border-t border-[#B88A42]/20 relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(184,138,66,0.06),_transparent_55%)] pointer-events-none" />

      {/* Newsletter Section */}
      <div className="border-b border-[#B88A42]/20 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0604]/90 relative z-10">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-[#B88A42] block">
              THE THALF GAZETTE
            </span>
            <h3 className="font-editorial text-3xl sm:text-5xl font-light text-[#F4EBDD] leading-[1.05] tracking-tight">
              A LITTLE DARK.<br />
              <span className="text-[#D09A4E]">IN YOUR INBOX.</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#B9AA99] font-light max-w-md mx-auto leading-relaxed">
              Stories of craft, secret small batches, and seasonal releases delivered quietly to connoisseurs.
            </p>
          </div>

          <form 
            onSubmit={(e) => e.preventDefault()} 
            className="max-w-md mx-auto flex items-center border border-[#B88A42]/30 bg-[#140C08] p-1.5 focus-within:border-[#B88A42] transition-colors shadow-2xl" 
            suppressHydrationWarning
          >
            <input
              type="email"
              placeholder="Enter your email address..."
              className="w-full bg-transparent px-4 py-2.5 text-xs text-[#F4EBDD] placeholder:text-[#B9AA99]/60 focus:outline-none font-sans"
              required
              suppressHydrationWarning
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 flex items-center space-x-1.5 flex-shrink-0 shadow-md"
              suppressHydrationWarning
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </form>
        </div>
      </div>

      {/* Four Column Luxury Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center space-x-3.5 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/thalf-logo-blend.png"
                  alt="THALF Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-2xl font-light tracking-[0.25em] text-[#F4EBDD] group-hover:text-[#D09A4E] transition-colors">
                  THALF
                </span>
                <span className="text-[8px] font-bold uppercase tracking-[0.38em] text-[#B88A42] font-sans -mt-0.5">
                  CHOCOLATES
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#B9AA99] font-light leading-relaxed max-w-xs">
              Handcrafted artisanal chocolates born in Kerala. Pure single-origin cocoa, balanced sweetness, and cinematic presentation.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B88A42]">Shop</h5>
            <ul className="space-y-2 text-xs text-[#B9AA99] font-light">
              <li><Link href="/shop" className="hover:text-[#F4EBDD] transition-colors">All Chocolates</Link></li>
              <li><Link href="/hampers" className="hover:text-[#F4EBDD] transition-colors">Gift Hampers</Link></li>
              <li><Link href="/#collection" className="hover:text-[#F4EBDD] transition-colors">Signature Collection</Link></li>
              <li><Link href="/shop" className="hover:text-[#F4EBDD] transition-colors">Artisanal Bars</Link></li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B88A42]">About</h5>
            <ul className="space-y-2 text-xs text-[#B9AA99] font-light">
              <li><Link href="/about/our-craft" className="hover:text-[#F4EBDD] transition-colors">Our Craft</Link></li>
              <li>
                <a 
                  href="https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDM3ODQ0Nzc0NzA0NDgz?story_media_id=3731029645358965602_77080028562&igsh=MTZvY2JqeGJxam9mZQ==&igsi=MTZvY2JqeGJxam9mZQ==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#F4EBDD] transition-colors"
                >
                  @thalf_chococraft
                </a>
              </li>
              <li><Link href="/#story" className="hover:text-[#F4EBDD] transition-colors">Our Story</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B88A42]">Support</h5>
            <ul className="space-y-2 text-xs text-[#B9AA99] font-light">
              <li>
                <span className="block text-[#F4EBDD] font-medium">Customer Support</span>
                <a href="https://wa.me/919061107915" target="_blank" rel="noopener noreferrer" className="hover:text-[#B88A42] transition-colors font-mono text-[11px] block mt-0.5">
                  WhatsApp: +91 90611 07915
                </a>
                <span className="text-[10px] text-[#B9AA99]/80">Mon – Sat: 9:00 AM – 7:00 PM IST</span>
              </li>
              <li className="pt-1">
                <Link href="/profile/dashboard" className="hover:text-[#F4EBDD] transition-colors text-[#D09A4E] font-medium">
                  Track Your Order &rarr;
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#F4EBDD] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-[#F4EBDD] transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#F4EBDD] transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#F4EBDD] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Fine Print */}
        <div className="mt-16 pt-8 border-t border-[#B88A42]/15 flex flex-col md:flex-row justify-between items-center text-[11px] text-[#B9AA99] space-y-4 md:space-y-0">
          <p suppressHydrationWarning>© {new Date().getFullYear()} THALF Chocolates. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-[#F4EBDD] transition-colors font-medium text-[#B88A42]/90 hover:text-[#B88A42]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#F4EBDD] transition-colors">Terms of Service</Link>
            <Link href="/shipping-policy" className="hover:text-[#F4EBDD] transition-colors font-medium text-[#B88A42]/90 hover:text-[#B88A42]">Shipping Policy</Link>
            <Link href="/return-policy" className="hover:text-[#F4EBDD] transition-colors font-medium text-[#B88A42]/90 hover:text-[#B88A42]">Return Policy</Link>
            <Link href="/refund-policy" className="hover:text-[#F4EBDD] transition-colors font-medium text-[#B88A42]/90 hover:text-[#B88A42]">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
