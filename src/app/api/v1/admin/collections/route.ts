import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { collectionService } from '@/services/collection.service';

export async function GET(req: NextRequest) {
  try {
    const collections = await collectionService.getCollections();
    return NextResponse.json({ success: true, collections });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'products.create');
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await req.json();
    const actorId = session.user.id;

    const collection = await collectionService.createCollection(body, actorId);
    return NextResponse.json({ success: true, collection });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'products.update');
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await req.json();
    const { id, ...data } = body;
    const actorId = session.user.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Collection ID is required' }, { status: 400 });
    }

    const updated = await collectionService.updateCollection(id, data, actorId);
    return NextResponse.json({ success: true, collection: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'products.archive');
  if (errorResponse || !session) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const actorId = session.user.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Collection ID is required' }, { status: 400 });
    }

    const deleted = await collectionService.deleteCollection(id, actorId);
    return NextResponse.json({ success: true, collection: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
