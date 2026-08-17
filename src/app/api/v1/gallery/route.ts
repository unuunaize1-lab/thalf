import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_GALLERY_IMAGES = [
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
