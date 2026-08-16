import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'marketing.read');
  if (errorResponse) return errorResponse;

  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: [
        { row: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin gallery images' },
      { status: 500 }
    );
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
