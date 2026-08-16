import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/product.service';

export class ProductController {
  async getProducts(req: NextRequest) {
    try {
      const searchParams = req.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '12');
      const search = searchParams.get('search') || undefined;
      const categorySlug = searchParams.get('category') || undefined;
      const collectionSlug = searchParams.get('collection') || undefined;
      const status = searchParams.get('status') || 'ACTIVE';
      const featured = searchParams.get('featured') === 'true' ? true : undefined;
      const sortBy = (searchParams.get('sortBy') as 'price-asc' | 'price-desc' | 'created-desc') || undefined;

      const result = await productService.getProducts({
        page,
        limit,
        search,
        categorySlug,
        collectionSlug,
        status,
        featured,
        sortBy,
      });

      return NextResponse.json({
        success: true,
        products: result.data,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async createProduct(req: NextRequest) {
    try {
      const body = await req.json();
      const product = await productService.createProduct(body);
      return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const productController = new ProductController();
