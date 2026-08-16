import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { requirePermission } from '@/lib/auth-guard';
import { productService } from '@/services/product.service';

function formatErrorMessage(error: any): string {
  if (error instanceof ZodError) {
    return error.issues.map((e: any) => `${e.path.join('.') || 'field'}: ${e.message}`).join(', ');
  }
  if (typeof error?.message === 'string') {
    try {
      const parsed = JSON.parse(error.message);
      if (Array.isArray(parsed)) {
        return parsed.map((e: any) => `${(e.path || []).join('.') || 'field'}: ${e.message || 'Invalid input'}`).join(', ');
      }
    } catch {
      // Not a JSON string
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}

export async function GET(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'products.read');
  if (errorResponse || !session) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const take = parseInt(searchParams.get('take') || '100', 10);
    const result = await productService.getProducts({ limit: take });
    return NextResponse.json({ success: true, products: result.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'products.create');
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await req.json();
    const actorId = session.user.id;

    const product = await productService.createProduct(body, actorId);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: formatErrorMessage(error) }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'products.update');
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    const actorId = session.user.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const product = await productService.updateProduct(id, updateData, actorId);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: formatErrorMessage(error) }, { status: 400 });
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
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const archivedProduct = await productService.deleteProduct(id, actorId);
    return NextResponse.json({ success: true, product: archivedProduct });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: formatErrorMessage(error) }, { status: 400 });
  }
}
