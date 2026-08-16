import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { categoryService } from '@/services/category.service';

export async function GET(req: NextRequest) {
  try {
    const categories = await categoryService.getCategories();
    return NextResponse.json({ success: true, categories });
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

    const category = await categoryService.createCategory(body, actorId);
    return NextResponse.json({ success: true, category });
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
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    const updated = await categoryService.updateCategory(id, data, actorId);
    return NextResponse.json({ success: true, category: updated });
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
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    const deleted = await categoryService.deleteCategory(id, actorId);
    return NextResponse.json({ success: true, category: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
