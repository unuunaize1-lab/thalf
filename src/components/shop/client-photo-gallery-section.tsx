'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface GalleryImageItem {
  id: string;
  imageUrl: string;
  alt: string;
  caption: string | null;
  row: number;
  sortOrder: number;
}

export function ClientPhotoGallerySection() {
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadGallery() {
      try {
        const res = await fetch('/api/v1/gallery');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.images)) {
          setImages(data.images);
        }
      } catch (err) {
        console.error('[GallerySection] Failed to load gallery images:', err);
      } finally {
        if (isMounted) setLoaded(true);
      }
    }
    loadGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  // Gracefully hide section if DB has no active gallery images uploaded
  if (loaded && images.length === 0) {
    return null;
  }

  const row1Images = images.filter((img) => img.row === 1);
  const row2Images = images.filter((img) => img.row === 2);

  // Fallback to splitting images evenly if only row 1 has images
  const finalRow1 = row1Images.length > 0 ? row1Images : images.slice(0, Math.ceil(images.length / 2));
  const finalRow2 = row2Images.length > 0 ? row2Images : images.slice(Math.ceil(images.length / 2));

  // Triple sequences to ensure zero visual gaps across wide 4K viewports during continuous marquee animation
  const row1Sequence = [...finalRow1, ...finalRow1, ...finalRow1, ...finalRow1];
  const row2Sequence = [...finalRow2, ...finalRow2, ...finalRow2, ...finalRow2];

  return (
    <section className="bg-obsidian text-cream py-24 relative overflow-hidden border-t border-b border-gold/20">
      {/* CSS Animation Keyframes for Continuous Infinite Marquee */}
      <style jsx global>{`
        @keyframes marqueeLeft {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes marqueeRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        .animate-marquee-left {
          display: flex;
          width: max-content;
          animation: marqueeLeft 45s linear infinite;
          will-change: transform;
        }

        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marqueeRight 45s linear infinite;
          will-change: transform;
        }

        .animate-marquee-left:hover,
        .animate-marquee-right:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-left,
          .animate-marquee-right {
            animation-duration: 120s;
            animation-play-state: paused;
          }
        }
      `}</style>

      {/* Radial ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(197,160,89,0.1),_transparent_75%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16 relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-ultra text-gold block">
          Client Showcase
        </span>

        <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-light text-cream leading-tight">
          Real Moments. <span className="poetic-italic gold-gradient-text font-normal">Real THALF.</span>
        </h2>

        <p className="text-xs sm:text-sm text-taupe font-light max-w-xl mx-auto leading-relaxed">
          A glimpse into the moments, celebrations, and sweetness shared with THALF.
        </p>
      </div>

      {/* Marquee Track Container — Page-level overflow protected */}
      <div className="w-full overflow-hidden space-y-6 relative z-10">
        {/* ROW 1: Continuous Leftward Marquee */}
        {finalRow1.length > 0 && (
          <div className="w-full overflow-hidden select-none">
            <div className="animate-marquee-left space-x-4 sm:space-x-6 pr-4 sm:pr-6">
              {row1Sequence.map((item, idx) => (
                <div
                  key={`r1-${item.id}-${idx}`}
                  className="flex-shrink-0 w-52 sm:w-72 md:w-80 aspect-[4/3] relative bg-dark/60 border border-gold/30 p-2 shadow-2xl group transition-all duration-500 hover:border-gold"
                >
                  <div className="relative w-full h-full overflow-hidden bg-obsidian">
                    <Image
                      src={item.imageUrl}
                      alt={item.alt || 'THALF Client Moment'}
                      fill
                      sizes="(max-width: 640px) 208px, (max-width: 768px) 288px, 320px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    {item.caption && (
                      <p className="absolute bottom-3 left-3 right-3 text-[10px] text-cream font-light italic truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROW 2: Continuous Rightward Marquee */}
        {finalRow2.length > 0 && (
          <div className="w-full overflow-hidden select-none">
            <div className="animate-marquee-right space-x-4 sm:space-x-6 pr-4 sm:pr-6">
              {row2Sequence.map((item, idx) => (
                <div
                  key={`r2-${item.id}-${idx}`}
                  className="flex-shrink-0 w-52 sm:w-72 md:w-80 aspect-[4/3] relative bg-dark/60 border border-gold/30 p-2 shadow-2xl group transition-all duration-500 hover:border-gold"
                >
                  <div className="relative w-full h-full overflow-hidden bg-obsidian">
                    <Image
                      src={item.imageUrl}
                      alt={item.alt || 'THALF Client Moment'}
                      fill
                      sizes="(max-width: 640px) 208px, (max-width: 768px) 288px, 320px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    {item.caption && (
                      <p className="absolute bottom-3 left-3 right-3 text-[10px] text-cream font-light italic truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
