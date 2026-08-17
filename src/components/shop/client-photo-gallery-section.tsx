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

const DEFAULT_GALLERY_IMAGES: GalleryImageItem[] = [
  {
    id: 'default-gal-1',
    imageUrl: '/images/gallery/gallery-1.jpg',
    alt: 'THALF Client Moment 1',
    caption: 'Handcrafted luxury chocolate hamper',
    row: 1,
    sortOrder: 1,
  },
  {
    id: 'default-gal-2',
    imageUrl: '/images/gallery/gallery-2.jpg',
    alt: 'THALF Client Moment 2',
    caption: 'Specially curated festive collection',
    row: 1,
    sortOrder: 2,
  },
  {
    id: 'default-gal-3',
    imageUrl: '/images/gallery/gallery-3.jpg',
    alt: 'THALF Client Moment 3',
    caption: 'Bespoke corporate & personal gifting',
    row: 1,
    sortOrder: 3,
  },
  {
    id: 'default-gal-4',
    imageUrl: '/images/gallery/gallery-4.jpg',
    alt: 'THALF Client Moment 4',
    caption: 'Artisanal chocolate presentation',
    row: 2,
    sortOrder: 4,
  },
  {
    id: 'default-gal-5',
    imageUrl: '/images/gallery/gallery-5.jpg',
    alt: 'THALF Client Moment 5',
    caption: 'Signature THALF chocolate box',
    row: 2,
    sortOrder: 5,
  },
];

export function ClientPhotoGallerySection() {
  const [images, setImages] = useState<GalleryImageItem[]>(DEFAULT_GALLERY_IMAGES);

  useEffect(() => {
    let isMounted = true;
    async function loadGallery() {
      try {
        const res = await fetch('/api/v1/gallery');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.images) && data.images.length > 0) {
          setImages(data.images);
        } else if (isMounted) {
          setImages(DEFAULT_GALLERY_IMAGES);
        }
      } catch (err) {
        console.error('[GallerySection] Failed to load gallery images:', err);
        if (isMounted) setImages(DEFAULT_GALLERY_IMAGES);
      }
    }
    loadGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayImages = images.length > 0 ? images : DEFAULT_GALLERY_IMAGES;

  const row1Images = displayImages.filter((img) => img.row === 1);
  const row2Images = displayImages.filter((img) => img.row === 2);

  // Fallback to splitting images evenly if only row 1 has images
  const finalRow1 = row1Images.length > 0 ? row1Images : displayImages.slice(0, Math.ceil(displayImages.length / 2));
  const finalRow2 = row2Images.length > 0 ? row2Images : displayImages.slice(Math.ceil(displayImages.length / 2));

  // Quadruple sequence to guarantee smooth 4K infinite looping
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
          animation: marqueeLeft 35s linear infinite;
          will-change: transform;
        }

        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marqueeRight 35s linear infinite;
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

      {/* Marquee Track Container */}
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
