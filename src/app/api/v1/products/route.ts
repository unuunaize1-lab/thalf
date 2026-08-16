import { NextRequest } from 'next/server';
import { productController } from '@/controllers/product.controller';

export async function GET(req: NextRequest) {
  return productController.getProducts(req);
}

export async function POST(req: NextRequest) {
  return productController.createProduct(req);
}
