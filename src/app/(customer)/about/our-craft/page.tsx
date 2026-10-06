'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CraftPage() {
  const craftPoints = [
    {
      step: '01',
      title: 'Carefully Selected Cocoa & Single-Origin Harvests',
      desc: 'We select cocoa beans and whole nuts with precision to ensure balanced flavor notes, rich butter consistency, and deep chocolate depth.',
    },
    {
      step: '02',
      title: 'Recipe Development & Controlled Tempering',
      desc: 'Formulated to highlight pure cacao character without excess sweetness, followed by meticulous tempering for an immaculate glossy sheen and crisp snap.',
    },
    {
      step: '03',
      title: 'Artisanal Hand-Poured Execution',
      desc: 'Each chocolate bar, kunafa bonbon, and nut rock cluster is poured, layered, and hand-finished with meticulous attention to detail.',
    },
    {
      step: '04',
      title: 'Cinematic Presentation & Gold Accents',
      desc: 'Enclosed in signature chocolate presentation boxes with gold foil touches, designed to turn unboxing into a treasured sensorial ritual.',
    },
  ];

  return (
    <div className="bg-[#100805] text-[#F4EBDD] min-h-screen pb-24 selection:bg-[#B88A42] selection:text-[#100805]">
      {/* 1. Hero Header */}
      <section className="bg-gradient-to-b from-[#080403] via-[#120704] to-[#100805] border-b border-[#B88A42]/20 pt-28 pb-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(184,138,66,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A42] border border-[#B88A42]/40 px-3 py-1 inline-block bg-[#170B07]">
            CRAFTED WITH PURPOSE
          </span>

          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-light text-[#F4EBDD] leading-tight">
            Handcrafted Chocolate.<br />
            <span className="italic font-normal text-[#D09A4E]">Sensually Realized.</span>
          </h1>

          <p className="text-xs sm:text-base text-[#B9AA99] font-light max-w-2xl mx-auto leading-relaxed">
            From bean selection and slow conching to our signature gold packaging, 
            every step is performed with intent and deep culinary reverence.
          </p>
        </div>
      </section>

      {/* 2. Our Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl border-b border-[#B88A42]/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A42] block">
              THE PHILOSOPHY
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-light text-[#F4EBDD] leading-tight">
              Quiet Luxury, <br />
              <span className="text-[#D09A4E] italic font-normal">Memorable Moments</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#B9AA99] font-light leading-relaxed">
              THALF was founded on a simple conviction: true luxury chocolate requires patience, uncompromising raw ingredients, and heartfelt craftsmanship. We do not rush batch times or use synthetic preservatives.
            </p>
            <p className="text-xs sm:text-sm text-[#B9AA99] font-light leading-relaxed">
              Every creation is made to evoke memories—the warmth of roasted nuts, the golden crunch of toasted kunafa, and the velvety decadence of fine dark chocolate.
            </p>
          </div>

          <div className="lg:col-span-6 relative aspect-[4/3] border border-[#B88A42]/30 p-2 bg-[#170B07] shadow-2xl">
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/images/cacao-harvest.png"
                alt="Crafted with Purpose"
                fill
                className="object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 3. The 4 Pillars of Crafting */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A42] block">
            THE METHODOLOGY
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl font-light text-[#F4EBDD]">
            Our Approach to Crafting
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {craftPoints.map((item) => (
            <div key={item.step} className="p-8 border border-[#B88A42]/25 bg-[#170B07] space-y-4 shadow-xl hover:border-[#D09A4E]/60 transition-colors">
              <span className="text-xs font-mono font-bold text-[#B88A42]">STEP {item.step}</span>
              <h3 className="font-editorial text-2xl font-normal text-[#F4EBDD]">
                {item.title}
              </h3>
              <p className="text-xs text-[#B9AA99] font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CTA */}
      <section className="py-24 bg-gradient-to-b from-[#170B07] to-[#080403] border-t border-[#B88A42]/20">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <Sparkles className="w-6 h-6 text-[#B88A42] mx-auto" />
          <h2 className="font-editorial text-4xl sm:text-5xl font-light text-[#F4EBDD]">
            Made for Meaningful Moments
          </h2>
          <p className="text-xs sm:text-sm text-[#B9AA99] font-light leading-relaxed max-w-xl mx-auto">
            Whether it&apos;s an intimate evening indulgence or an opulent gift for someone special, experience THALF chocolate.
          </p>

          <div className="pt-4">
            <Link
              href="/shop"
              className="px-8 py-4 bg-[#B88A42] text-[#100805] hover:bg-[#D09A4E] text-xs uppercase tracking-widest font-semibold transition-all duration-300 inline-flex items-center space-x-2 shadow-lg"
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
