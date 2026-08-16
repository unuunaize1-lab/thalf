import { NextResponse } from 'next/server';
import { productRepository } from '@/repositories/product.repository';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let product: any = await productRepository.findById(id);
    if (!product) {
      product = await productRepository.findBySlug(id);
    }

    if (!product || product.status !== 'ACTIVE' || product.isDeleted) {
      return NextResponse.json({ success: false, error: 'Product not found or unavailable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
