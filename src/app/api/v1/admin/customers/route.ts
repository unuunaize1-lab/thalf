import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await requirePermission(req, 'customers.read');
    if (errorResponse) return errorResponse;

    const customers = await prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
        role: { select: { name: true } },
        addresses: {
          select: { city: true, isDefault: true },
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = customers.map((c) => {
      const totalSpent = c.orders.reduce((sum, ord) => sum + Number(ord.totalAmount || 0), 0);
      const defaultCity = c.addresses[0]?.city || 'N/A';
      return {
        id: c.id,
        name: c.name || 'Artisanal Patron',
        email: c.email || 'N/A',
        phone: c.phone || 'N/A',
        role: c.role?.name || 'CUSTOMER',
        totalOrders: c.orders.length,
        totalSpent,
        joinedDate: c.createdAt ? c.createdAt.toISOString().split('T')[0] : 'N/A',
        defaultCity,
        recentOrders: c.orders.map((o) => ({
          orderNumber: o.orderNumber,
          date: o.createdAt ? o.createdAt.toISOString().split('T')[0] : 'N/A',
          amount: Number(o.totalAmount || 0),
          status: o.status,
        })),
      };
    });

    return NextResponse.json({ success: true, customers: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch customer directory' }, { status: 500 });
  }
}
