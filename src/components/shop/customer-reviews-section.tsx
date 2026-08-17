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

  return (
    <section className="py-24 bg-champagne/40 border-b border-parchment relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border border-gold/30 rounded-full shadow-sm mb-2">
            <MessageSquareHeart className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] font-bold uppercase tracking-ultra text-gold">
              Patron Testimonials
            </span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl font-light text-dark leading-tight">
            Kind Words <span className="poetic-italic font-normal text-gold">&</span> Real Reviews
          </h2>

          <p className="text-xs sm:text-sm text-taupe font-light leading-relaxed max-w-xl mx-auto">
            Authentic experiences and feedback shared directly by clients who have enjoyed THALF artisanal creations.
          </p>

          <div className="flex justify-center items-center space-x-1 pt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-gold fill-gold" />
            ))}
            <span className="text-xs font-mono text-taupe ml-2 font-semibold">5.0 / 5.0 Rating</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              onClick={() => setActiveReview(review)}
              className="group relative bg-white border border-parchment p-3 shadow-lux hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/5] bg-dark/5 overflow-hidden border border-parchment/60">
                <Image
                  src={review.image}
                  alt={review.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-contain group-hover:scale-105 transition-transform duration-700 p-1"
                />
                
                {/* Hover overlay with zoom prompt */}
                <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white space-y-2 p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-gold text-dark flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cream">
                    Click to Enlarge
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-parchment/60 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-ultra text-gold block">
                    {review.tag}
                  </span>
                  <h3 className="font-editorial text-sm font-medium text-dark line-clamp-1 group-hover:text-gold transition-colors">
                    {review.title}
                  </h3>
                </div>
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-gold" />
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
          className="fixed inset-0 z-50 bg-obsidian/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setActiveReview(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-dark border border-gold/40 p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="w-full flex justify-between items-center pb-4 mb-4 border-b border-gold/20">
              <div className="flex items-center space-x-2">
                <Quote className="w-5 h-5 text-gold" />
                <span className="font-serif text-lg font-bold text-cream uppercase tracking-wider">
                  {activeReview.title}
                </span>
              </div>
              <button
                onClick={() => setActiveReview(null)}
                className="p-2 text-parchment/60 hover:text-gold transition-colors rounded-full hover:bg-gold/10"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative w-full h-[65vh] sm:h-[75vh] bg-dark/80 rounded border border-parchment/20 flex items-center justify-center overflow-hidden">
              <Image
                src={activeReview.image}
                alt={activeReview.title}
                fill
                className="object-contain p-2"
                priority
              />
            </div>

            {/* Modal Footer */}
            <div className="w-full pt-4 mt-2 flex justify-between items-center text-xs text-parchment/60 font-light">
              <span>Client Review Screenshot</span>
              <div className="flex items-center space-x-1 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
