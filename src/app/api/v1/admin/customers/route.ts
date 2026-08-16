import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'customers.read');
  if (errorResponse) return errorResponse;

  try {
    const customers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        phoneVerifiedAt: true,
        createdAt: true,
        role: { select: { name: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
