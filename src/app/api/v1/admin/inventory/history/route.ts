import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { inventoryService } from '@/services/inventory.service';

export async function GET(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'products.read');
  if (errorResponse || !session) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const history = await inventoryService.getInventoryHistory(productId, limit, offset);
    return NextResponse.json({ success: true, ...history });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
