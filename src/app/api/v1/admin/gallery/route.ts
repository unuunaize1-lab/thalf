import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guard';

const DEFAULT_ADMIN_GALLERY_IMAGES = [
  {
    id: 'default-gal-1',
    imageUrl: '/images/gallery/gallery-1.jpg',
    publicId: null,
    alt: 'THALF Client Moment 1',
    caption: 'Handcrafted luxury chocolate hamper',
    row: 1,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-gal-2',
    imageUrl: '/images/gallery/gallery-2.jpg',
    publicId: null,
    alt: 'THALF Client Moment 2',
    caption: 'Specially curated festive collection',
    row: 1,
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-gal-3',
    imageUrl: '/images/gallery/gallery-3.jpg',
    publicId: null,
    alt: 'THALF Client Moment 3',
    caption: 'Bespoke corporate & personal gifting',
    row: 1,
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-gal-4',
    imageUrl: '/images/gallery/gallery-4.jpg',
    publicId: null,
    alt: 'THALF Client Moment 4',
    caption: 'Artisanal chocolate presentation',
    row: 2,
    sortOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-gal-5',
    imageUrl: '/images/gallery/gallery-5.jpg',
    publicId: null,
    alt: 'THALF Client Moment 5',
    caption: 'Signature THALF chocolate box',
    row: 2,
    sortOrder: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'marketing.read');
  if (errorResponse) return errorResponse;

  try {
    const dbImages = await prisma.galleryImage.findMany({
      orderBy: [
        { row: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      images: dbImages.length > 0 ? dbImages : DEFAULT_ADMIN_GALLERY_IMAGES,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      images: DEFAULT_ADMIN_GALLERY_IMAGES,
    });
  }
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'marketing.manage');
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { imageUrl, publicId, alt, caption, row, sortOrder, isActive } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const image = await prisma.galleryImage.create({
      data: {
        imageUrl,
        publicId: publicId || null,
        alt: alt || 'THALF Client Moment',
        caption: caption || null,
        row: typeof row === 'number' ? row : 1,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      image,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create gallery image' },
      { status: 500 }
    );
  }
}
