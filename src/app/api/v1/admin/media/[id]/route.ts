import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { MediaService } from '@/services/media.service';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requirePermission(req, 'products.update');
  if (errorResponse || !session) return errorResponse;

  try {
    const resolvedParams = await params;
    const imageId = resolvedParams.id;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'imageId parameter is required' },
        { status: 400 }
      );
    }

    const actorId = session.user.id;
    const result = await MediaService.deleteMediaAsset(imageId, actorId);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requirePermission(req, 'products.update');
  if (errorResponse || !session) return errorResponse;

  try {
    const resolvedParams = await params;
    const imageId = resolvedParams.id;
    const body = await req.json();
    const { action, productId, orders } = body;

    const actorId = session.user.id;

    if (action === 'SET_PRIMARY') {
      if (!productId) {
        return NextResponse.json({ success: false, error: 'productId parameter required' }, { status: 400 });
      }
      const updated = await MediaService.setPrimaryImage(imageId, productId, actorId);
      return NextResponse.json({ success: true, image: updated });
    }

    if (action === 'REORDER') {
      if (!productId || !Array.isArray(orders)) {
        return NextResponse.json({ success: false, error: 'productId and orders array required' }, { status: 400 });
      }
      const result = await MediaService.reorderGallery(productId, orders, actorId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Invalid media PATCH action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
