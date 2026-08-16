import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { inventoryService } from '@/services/inventory.service';

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'inventory.adjust');
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await req.json();
    const { productId, deltaQuantity, adjustment, reason, note } = body;

    const adjustAmount = typeof adjustment === 'number' ? adjustment : deltaQuantity;

    if (!productId || typeof adjustAmount !== 'number' || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: productId, adjustment (or deltaQuantity), reason' },
        { status: 400 }
      );
    }

    const actorId = session.user.id; // Derived EXCLUSIVELY from authenticated session

    const result = await inventoryService.adjustInventory({
      productId,
      adjustment: adjustAmount,
      reason,
      note,
      actorId,
    });

    return NextResponse.json({
      success: true,
      inventory: result.inventory,
      log: result.log,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Inventory adjustment failed' },
      { status: 400 }
    );
  }
}
