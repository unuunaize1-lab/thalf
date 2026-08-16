'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-obsidian text-champagne border-t border-gold/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(197,160,89,0.06),_transparent_50%)] pointer-events-none" />

      {/* Newsletter */}
      <div className="border-b border-gold/20 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h3 className="font-editorial text-3xl sm:text-4xl font-light text-cream leading-tight">
            Stay updated with THALF
          </h3>
          <p className="text-xs sm:text-sm text-taupe font-light max-w-lg mx-auto leading-relaxed">
            Subscribe to receive announcements about new chocolates and seasonal editions.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto flex items-center border border-gold/40 bg-dark/60 p-1.5 focus-within:border-gold transition-colors" suppressHydrationWarning>
            <input
              type="email"
              placeholder="Enter your email address..."
              className="w-full bg-transparent px-4 py-2.5 text-xs text-cream placeholder:text-taupe focus:outline-none font-sans"
              required
              suppressHydrationWarning
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-gold text-dark hover:bg-gold-light text-xs font-semibold uppercase tracking-ultra transition-all duration-300 flex items-center space-x-1 flex-shrink-0"
              suppressHydrationWarning
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Four Column Nav */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <span className="font-editorial text-3xl font-light tracking-[0.25em] text-cream block">THALF</span>
            <p className="text-xs text-taupe font-light leading-relaxed">Handcrafted Chocolate. Thoughtfully Presented.</p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-bold uppercase tracking-ultra text-gold">Shop</h5>
            <ul className="space-y-2 text-xs text-taupe font-light">
              <li><Link href="/shop" className="hover:text-cream transition-colors">All Chocolates</Link></li>
              <li><Link href="/shop" className="hover:text-cream transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-bold uppercase tracking-ultra text-gold">About</h5>
            <ul className="space-y-2 text-xs text-taupe font-light">
              <li><Link href="/about/our-craft" className="hover:text-cream transition-colors">Our Craft</Link></li>
              <li>
                <a href="https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDM3ODQ0Nzc0NzA0NDgz?story_media_id=3731029645358965602_77080028562&igsh=MTZvY2JqeGJxam9mZQ==&igsi=MTZvY2JqeGJxam9mZQ==" target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors">
                  @thalf_chococraft
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-bold uppercase tracking-ultra text-gold">Support</h5>
            <ul className="space-y-2 text-xs text-taupe font-light">
              <li>
                <span className="block text-cream font-medium">Customer Support</span>
                <a href="https://wa.me/919061107915" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors font-mono text-[11px] block mt-0.5">
                  WhatsApp: +91 90611 07915
                </a>
                <span className="text-[10px] text-taupe">Mon – Sat: 9:00 AM – 7:00 PM IST</span>
              </li>
              <li className="pt-1">
                <Link href="/profile/dashboard" className="hover:text-cream transition-colors text-gold">
                  Track Your Order &rarr;
                </Link>
              </li>
              <li>
                <Link href="/returns-refunds" className="hover:text-cream transition-colors">
                  Returns &amp; Refunds
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Fine Print */}
        <div className="mt-16 pt-8 border-t border-gold/15 flex flex-col md:flex-row justify-between items-center text-[11px] text-taupe space-y-4 md:space-y-0">
          <p suppressHydrationWarning>© {new Date().getFullYear()} THALF. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-cream transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-cream transition-colors">Terms of Service</Link>
            <Link href="/shipping" className="hover:text-cream transition-colors">Shipping Policy</Link>
            <Link href="/returns-refunds" className="hover:text-cream transition-colors font-medium text-gold/90 hover:text-gold">Returns &amp; Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
