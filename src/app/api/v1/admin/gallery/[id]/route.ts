import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guard';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { errorResponse } = await requirePermission(req, 'marketing.manage');
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Gallery image not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.galleryImage.update({
      where: { id },
      data: {
        ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
        ...(body.alt !== undefined ? { alt: body.alt } : {}),
        ...(body.caption !== undefined ? { caption: body.caption } : {}),
        ...(body.row !== undefined ? { row: Number(body.row) } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
        ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      image: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update gallery image' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { errorResponse } = await requirePermission(req, 'marketing.manage');
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;

    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Gallery image not found' },
        { status: 404 }
      );
    }

    await prisma.galleryImage.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Gallery image deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete gallery image' },
      { status: 500 }
    );
  }
}
