import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/order.service';
import { requirePermission } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'orders.read');
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const search = searchParams.get('search') || undefined;

    const orders = await orderService.getAdminOrders({ status, search });
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
