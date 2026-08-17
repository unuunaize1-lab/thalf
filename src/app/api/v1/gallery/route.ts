import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_GALLERY_IMAGES = [
  {
    id: 'default-gal-1',
    imageUrl: '/images/gallery/gallery-1.jpg',
    alt: 'THALF Artisanal Moment',
    caption: 'Handcrafted luxury chocolate hamper',
    row: 1,
    sortOrder: 1,
  },
  {
    id: 'default-gal-2',
    imageUrl: '/images/gallery/gallery-2.jpg',
    alt: 'THALF Celebration Box',
    caption: 'Specially curated festive collection',
    row: 1,
    sortOrder: 2,
  },
  {
    id: 'default-gal-3',
    imageUrl: '/images/gallery/gallery-3.jpg',
    alt: 'THALF Signature Gift Box',
    caption: 'Bespoke corporate & personal gifting',
    row: 2,
    sortOrder: 3,
  },
  {
    id: 'default-gal-4',
    imageUrl: '/images/hero-chocolate.png',
    alt: 'THALF Master Creation',
    caption: 'Balanced sweetness & rich cacao',
    row: 2,
    sortOrder: 4,
  },
  {
    id: 'default-gal-5',
    imageUrl: '/images/behind-the-scenes-atelier.png',
    alt: 'THALF Atelier Crafting',
    caption: 'Behind the scenes at our chocolate atelier',
    row: 1,
    sortOrder: 5,
  },
  {
    id: 'default-gal-6',
    imageUrl: '/images/cacao-harvest.png',
    alt: 'Single Origin Cacao Reserve',
    caption: 'Ethically sourced single-origin cocoa beans',
    row: 2,
    sortOrder: 6,
  },
];

export async function GET() {
  try {
    const dbImages = await prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: [
        { row: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      images: dbImages.length > 0 ? dbImages : DEFAULT_GALLERY_IMAGES,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      images: DEFAULT_GALLERY_IMAGES,
    });
  }
}
