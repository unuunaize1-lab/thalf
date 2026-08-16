'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

export default function CraftPage() {
  const craftPoints = [
    {
      step: '01',
      title: 'Carefully Selected Cocoa & Ingredients',
      desc: 'We select cocoa beans and ingredients with care to ensure balanced flavor profiles and exceptional consistency.',
    },
    {
      step: '02',
      title: 'Recipe Development & Controlled Tempering',
      desc: 'Formulated to highlight pure chocolate notes without excess sweetness, followed by careful tempering for a glossy finish and satisfying snap.',
    },
    {
      step: '03',
      title: 'Handcrafted Attention to Detail',
      desc: 'Each chocolate bar, truffle, and praline is hand-finished, ensuring high aesthetic standards before packaging.',
    },
    {
      step: '04',
      title: 'Thoughtful Presentation',
      desc: 'Packed in signature presentation boxes, designed to make unboxing feel personal and memorable.',
    },
  ];

  return (
    <div className="bg-cream text-dark min-h-screen pb-24">
      {/* 1. Hero Header */}
      <section className="bg-obsidian text-champagne border-b border-gold/20 py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(197,160,89,0.15),_transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block border border-gold/30 px-3 py-1 inline-block bg-dark/40">
            CRAFTED WITH PURPOSE
          </span>

          <h1 className="font-editorial text-4xl sm:text-6xl font-light text-cream leading-tight">
            Handcrafted Chocolate.<br />
            <span className="poetic-italic gold-gradient-text font-normal">Thoughtfully Presented.</span>
          </h1>

          <p className="text-xs sm:text-base text-taupe font-light max-w-2xl mx-auto leading-relaxed">
            From recipe development to final presentation, every detail is considered to deliver a premium chocolate experience.
          </p>
        </div>
      </section>

      {/* 2. Our Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl border-b border-parchment/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">
              Our Story
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-light text-dark leading-tight">
              Simple Ideas, Memorable Moments
            </h2>
            <p className="text-xs sm:text-sm text-taupe font-light leading-relaxed">
              THALF was created with a simple idea—to make enjoying premium handmade chocolate feel truly special. We believe great chocolate isn&apos;t rushed. Every collection is thoughtfully crafted to create memorable moments.
            </p>
          </div>

          <div className="lg:col-span-6 relative aspect-[4/3] border border-parchment p-3 bg-white shadow-xl">
            <Image
              src="/images/cacao-harvest.png"
              alt="Crafted with Purpose"
              fill
              className="object-cover"
            />
          </div>

        </div>
      </section>

      {/* 3. The 4 Pillars of Crafting */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">
            Crafted with Purpose
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl font-light text-dark">
            Our Approach to Crafting
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {craftPoints.map((item) => (
            <div key={item.step} className="p-8 border border-parchment bg-white/70 space-y-4 shadow-sm hover:border-gold transition-colors">
              <span className="text-xs font-mono font-bold text-gold">STEP {item.step}</span>
              <h3 className="font-editorial text-2xl font-normal text-dark">
                {item.title}
              </h3>
              <p className="text-xs text-taupe font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* 5. CTA */}
      <section className="py-20 bg-obsidian text-champagne border-t border-gold/20">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <Sparkles className="w-6 h-6 text-gold mx-auto" />
          <h2 className="font-editorial text-4xl sm:text-5xl font-light text-cream">
            Made for Meaningful Moments
          </h2>
          <p className="text-xs sm:text-sm text-taupe font-light leading-relaxed">
            Whether it&apos;s a celebration or a personal indulgence, THALF chocolates are crafted with care.
          </p>

          <div className="pt-4">
            <Link
              href="/shop"
              className="px-8 py-4 bg-gold text-dark hover:bg-gold-light text-xs uppercase tracking-ultra font-semibold transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
