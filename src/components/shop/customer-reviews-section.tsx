'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, ZoomIn, X, Quote, MessageSquareHeart } from 'lucide-react';

interface ReviewItem {
  id: string;
  image: string;
  originalName: string;
  title: string;
  tag: string;
}

const REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    image: '/images/reviews/review-1.png',
    originalName: 'Screenshot 2026-08-17 103929.png',
    title: 'Generous Flavor & Smooth Texture',
    tag: 'Verified Client Feedback',
  },
  {
    id: 'rev-2',
    image: '/images/reviews/review-2.png',
    originalName: 'Screenshot 2026-08-17 104000.png',
    title: 'Exquisite Presentation & Taste',
    tag: 'Verified Client Feedback',
  },
  {
    id: 'rev-3',
    image: '/images/reviews/review-3.png',
    originalName: 'Screenshot 2026-08-17 104018.png',
    title: 'Pure Artisanal Delight',
    tag: 'Verified Client Feedback',
  },
  {
    id: 'rev-4',
    image: '/images/reviews/review-4.png',
    originalName: 'Screenshot 2026-08-17 104038.png',
    title: 'Perfect Luxury Gift Experience',
    tag: 'Verified Client Feedback',
  },
];

export function CustomerReviewsSection() {
  const [activeReview, setActiveReview] = useState<ReviewItem | null>(null);

  // Repeat reviews 4 times to ensure seamless infinite looping with no visual gaps
  const marqueeSequence = [...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS];

  return (
    <section className="py-24 bg-[#140A06] border-b border-[#B88A42]/20 relative overflow-hidden select-none">
      {/* CSS Animation Keyframes for Continuous Infinite Marquee */}
      <style jsx global>{`
        @keyframes marqueeReviewsLeft {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee-reviews {
          display: flex;
          width: max-content;
          animation: marqueeReviewsLeft 35s linear infinite;
          will-change: transform;
        }

        .animate-marquee-reviews:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-reviews {
            animation-duration: 90s;
            animation-play-state: paused;
          }
        }
      `}</style>

      {/* Ambient background decoration */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B88A42_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 mb-16 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#211109] border border-[#B88A42]/30 rounded-full shadow-sm mb-2">
          <MessageSquareHeart className="w-4 h-4 text-[#B88A42]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B88A42]">
            Patron Testimonials
          </span>
        </div>

        <h2 className="font-editorial text-3xl sm:text-5xl font-light text-[#F4EBDD] leading-tight">
          Kind Words <span className="poetic-italic font-normal text-[#D09A4E]">&</span> Real Reviews
        </h2>

        <p className="text-xs sm:text-sm text-[#B9AA99] font-light leading-relaxed max-w-xl mx-auto">
          Authentic feedback and client messages shared directly by THALF connoisseurs.
        </p>

        <div className="flex justify-center items-center space-x-1 pt-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-[#B88A42] fill-[#B88A42]" />
          ))}
          <span className="text-xs font-mono text-[#B9AA99] ml-2 font-semibold">5.0 / 5.0 Rating</span>
        </div>
      </div>

      {/* Continuous Marquee Track */}
      <div className="w-full overflow-hidden select-none relative z-10">
        <div className="animate-marquee-reviews space-x-6 pr-6">
          {marqueeSequence.map((review, idx) => (
            <div
              key={`marquee-rev-${review.id}-${idx}`}
              onClick={() => setActiveReview(review)}
              className="flex-shrink-0 w-64 sm:w-80 bg-[#1E110A] border border-[#B88A42]/25 p-3 shadow-2xl hover:border-[#B88A42] hover:bg-[#25140C] transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between group"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/5] bg-[#120805] overflow-hidden border border-[#B88A42]/20">
                <Image
                  src={review.image}
                  alt={review.title}
                  fill
                  sizes="(max-width: 640px) 256px, 320px"
                  className="object-contain group-hover:scale-105 transition-transform duration-700 p-1"
                />
                
                {/* Hover overlay with zoom prompt */}
                <div className="absolute inset-0 bg-[#0B0604]/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white space-y-2 p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#B88A42] text-[#100805] flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <ZoomIn className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4EBDD]">
                    Click to Enlarge
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#B88A42]/20 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#B88A42] block">
                    {review.tag}
                  </span>
                  <h3 className="font-editorial text-xs font-medium text-[#F4EBDD] line-clamp-1 group-hover:text-[#D09A4E] transition-colors">
                    {review.title}
                  </h3>
                </div>
                <div className="flex text-[#B88A42]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#B88A42]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {activeReview && (
        <div
          className="fixed inset-0 z-50 bg-[#0B0604]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setActiveReview(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-[#140C08] border border-[#B88A42]/40 p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="w-full flex justify-between items-center pb-4 mb-4 border-b border-[#B88A42]/20">
              <div className="flex items-center space-x-2">
                <Quote className="w-5 h-5 text-[#B88A42]" />
                <span className="font-editorial text-lg font-bold text-[#F4EBDD] uppercase tracking-wider">
                  {activeReview.title}
                </span>
              </div>
              <button
                onClick={() => setActiveReview(null)}
                className="p-2 text-[#B9AA99] hover:text-[#B88A42] transition-colors rounded-full hover:bg-[#B88A42]/10"
                aria-label="Close modal"
                suppressHydrationWarning
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative w-full h-[65vh] sm:h-[75vh] bg-[#0B0604] rounded border border-[#B88A42]/20 flex items-center justify-center overflow-hidden">
              <Image
                src={activeReview.image}
                alt={activeReview.title}
                fill
                className="object-contain p-2"
                priority
              />
            </div>

            {/* Modal Footer */}
            <div className="w-full pt-4 mt-2 flex justify-between items-center text-xs text-[#B9AA99] font-light">
              <span>Client Review Screenshot</span>
              <div className="flex items-center space-x-1 text-[#B88A42]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#B88A42]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
