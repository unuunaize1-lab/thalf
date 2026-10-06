import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { errorResponse } = await requirePermission(req, 'reviews.delete');
    if (errorResponse) return errorResponse;

    const { id } = await params;
    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete review' }, { status: 500 });
  }
}
