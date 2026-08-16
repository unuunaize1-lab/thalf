import { productRepository } from '@/repositories/product.repository';
import { CreateProductInput, UpdateProductInput, createProductSchema, updateProductSchema } from '@/validators/product.validator';
import { auditService } from './audit.service';
import { prisma } from '@/lib/prisma';

export class ProductService {

  /**
   * Perform publishing validation when product status is set to ACTIVE
   */
  static validatePublishingRequirements(productData: {
    name?: string;
    sku?: string;
    price?: number | any;
    categoryId?: string;
    images?: any[];
    inventoryStock?: number;
    allowNoImages?: boolean;
  }) {
    if (!productData.name || productData.name.trim().length < 2) {
      throw new Error('Publishing validation failed: Product name is required (min 2 chars).');
    }
    if (!productData.sku || productData.sku.trim().length < 3) {
      throw new Error('Publishing validation failed: Valid SKU is required (min 3 chars).');
    }
    const priceNum = Number(productData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      throw new Error('Publishing validation failed: Selling price must be a positive number.');
    }
    if (!productData.categoryId) {
      throw new Error('Publishing validation failed: Product must be assigned to a valid Category.');
    }
    if (!productData.allowNoImages && (!productData.images || productData.images.length === 0)) {
      throw new Error('Publishing validation failed: Product must have at least 1 image before activating.');
    }
  }

  async getProducts(params: {
    page?: number;
    limit?: number;
    categorySlug?: string;
    collectionSlug?: string;
    search?: string;
    cacaoPercentage?: number;
    featured?: boolean;
    status?: string;
    sortBy?: 'price-asc' | 'price-desc' | 'created-desc';
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    const { products, total } = await productRepository.findMany({
      skip,
      take: limit,
      categorySlug: params.categorySlug,
      collectionSlug: params.collectionSlug,
      search: params.search,
      cacaoPercentage: params.cacaoPercentage,
      featured: params.featured,
      status: params.status,
      sortBy: params.sortBy,
    });

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with ID '${id}' not found`);
    }
    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new Error(`Product with slug '${slug}' not found`);
    }
    return product;
  }

  async getProductBySlugOrId(identifier: string) {
    const product = await productRepository.findBySlugOrId(identifier);
    if (!product) {
      throw new Error(`Product with identifier '${identifier}' not found`);
    }
    return product;
  }

  async createProduct(input: CreateProductInput, actorId?: string) {
    const validatedData = createProductSchema.parse(input);

    // 1. Check duplicate SKU
    const existingSku = await productRepository.findBySku(validatedData.sku);
    if (existingSku) {
      throw new Error(`Duplicate SKU error: Product SKU '${validatedData.sku}' already exists.`);
    }

    // 2. Check duplicate Slug
    const existingSlug = await productRepository.findBySlug(validatedData.slug);
    if (existingSlug) {
      throw new Error(`Duplicate slug error: Product slug '${validatedData.slug}' already exists.`);
    }

    // 3. Publishing validation if status is ACTIVE
    if (validatedData.status === 'ACTIVE') {
      ProductService.validatePublishingRequirements({
        name: validatedData.name,
        sku: validatedData.sku,
        price: validatedData.price,
        categoryId: validatedData.categoryId,
        images: validatedData.images,
        allowNoImages: true, // Allow product creation without Cloudinary images attached yet
      });
    }

    const newProduct = await productRepository.create(validatedData);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'CREATE_PRODUCT',
        entity: 'Product',
        entityId: newProduct.id,
        details: {
          name: newProduct.name,
          sku: newProduct.sku,
          price: Number(newProduct.price),
          status: newProduct.status,
        },
      });
    }

    return newProduct;
  }

  async updateProduct(id: string, input: UpdateProductInput, actorId?: string) {
    const validatedData = updateProductSchema.parse(input);

    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error(`Product with ID '${id}' not found.`);
    }

    // 1. Check duplicate SKU
    if (validatedData.sku && validatedData.sku !== existing.sku) {
      const duplicateSku = await productRepository.findBySku(validatedData.sku);
      if (duplicateSku && duplicateSku.id !== id) {
        throw new Error(`Duplicate SKU error: Product SKU '${validatedData.sku}' already exists.`);
      }
    }

    // 2. Check duplicate Slug
    if (validatedData.slug && validatedData.slug !== existing.slug) {
      const duplicateSlug = await productRepository.findBySlug(validatedData.slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        throw new Error(`Duplicate slug error: Product slug '${validatedData.slug}' already exists.`);
      }
    }

    // 3. Publishing validation if status is changing to ACTIVE
    const targetStatus = validatedData.status || existing.status;
    if (targetStatus === 'ACTIVE') {
      ProductService.validatePublishingRequirements({
        name: validatedData.name || existing.name,
        sku: validatedData.sku || existing.sku,
        price: validatedData.price !== undefined ? validatedData.price : Number(existing.price),
        categoryId: validatedData.categoryId || existing.categoryId,
        images: existing.images,
      });
    }

    const updatedProduct = await productRepository.update(id, validatedData);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'UPDATE_PRODUCT',
        entity: 'Product',
        entityId: id,
        details: {
          updatedFields: Object.keys(validatedData),
          status: updatedProduct.status,
        },
      });
    }

    return updatedProduct;
  }

  async deleteProduct(id: string, actorId?: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error(`Product with ID '${id}' not found.`);
    }

    // Check if product has orders before deleting/archiving
    const hasOrders = await productRepository.hasAssociatedOrders(id);

    const archivedProduct = await productRepository.softDelete(id);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'ARCHIVE_PRODUCT',
        entity: 'Product',
        entityId: id,
        details: {
          name: existing.name,
          sku: existing.sku,
          hasAssociatedOrders: hasOrders,
        },
      });
    }

    return archivedProduct;
  }
}

export const productService = new ProductService();
