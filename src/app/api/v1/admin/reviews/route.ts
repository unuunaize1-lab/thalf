import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await requirePermission(req, 'reviews.read');
    if (errorResponse) return errorResponse;

    const reviews = await prisma.review.findMany({
      include: {
        product: { select: { name: true } },
        user: { select: { name: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      productName: r.product?.name || 'Artisanal Creation',
      customerName: r.user?.name || r.user?.phone || 'Customer',
      rating: r.rating,
      comment: r.comment,
      isVerified: r.isVerified,
      status: 'APPROVED',
      createdAt: r.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json({ success: true, reviews: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}
