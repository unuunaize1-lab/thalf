import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { CreateProductInput, UpdateProductInput } from '@/validators/product.validator';

export class ProductRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    categorySlug?: string;
    collectionSlug?: string;
    search?: string;
    cacaoPercentage?: number;
    featured?: boolean;
    status?: string;
    sortBy?: 'price-asc' | 'price-desc' | 'created-desc';
  }) {
    const { skip = 0, take = 12, categorySlug, collectionSlug, search, cacaoPercentage, featured, status = 'ACTIVE', sortBy } = params;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(status && status !== 'ALL' ? { status } : {}),
      ...(featured !== undefined && { featured }),
      ...(cacaoPercentage && { cacaoPercentage }),
      ...(categorySlug && categorySlug !== 'All' && categorySlug !== 'ALL' && {
        category: {
          OR: [
            { slug: categorySlug },
            { name: { equals: categorySlug, mode: 'insensitive' } },
          ],
        },
      }),
      ...(collectionSlug && collectionSlug !== 'All' && collectionSlug !== 'ALL' && {
        collections: {
          some: {
            OR: [
              { slug: collectionSlug },
              { name: { equals: collectionSlug, mode: 'insensitive' } },
            ],
          },
        },
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'price-asc') orderBy = { price: 'asc' };
    if (sortBy === 'price-desc') orderBy = { price: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: true,
          collections: true,
          images: { orderBy: { order: 'asc' } },
          inventory: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, skip, take };
  }

  async findById(id: string) {
    return prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: {
        category: true,
        collections: true,
        images: { orderBy: { order: 'asc' } },
        inventory: true,
        reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findBySku(sku: string) {
    return prisma.product.findFirst({
      where: { sku: { equals: sku, mode: 'insensitive' }, isDeleted: false },
    });
  }

  async findBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug: { equals: slug, mode: 'insensitive' }, isDeleted: false },
      include: {
        category: true,
        collections: true,
        images: { orderBy: { order: 'asc' } },
        inventory: true,
      },
    });
  }

  async findBySlugOrId(identifier: string) {
    return prisma.product.findFirst({
      where: {
        isDeleted: false,
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
      },
      include: {
        category: true,
        collections: true,
        images: { orderBy: { order: 'asc' } },
        inventory: true,
        reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: CreateProductInput) {
    const { images, initialStock, categoryId, collectionId, collectionIds, ...productFields } = data;

    const targetCollectionIds: string[] = [];
    if (collectionIds && Array.isArray(collectionIds)) {
      targetCollectionIds.push(...collectionIds);
    }
    if (collectionId && !targetCollectionIds.includes(collectionId)) {
      targetCollectionIds.push(collectionId);
    }

    return prisma.product.create({
      data: {
        ...productFields,
        category: { connect: { id: categoryId } },
        ...(targetCollectionIds.length > 0 && {
          collections: {
            connect: targetCollectionIds.map(id => ({ id })),
          },
        }),
        images: images && images.length > 0 ? {
          createMany: {
            data: images.map((img, index) => ({
              url: img.url,
              alt: img.alt,
              isDefault: img.isDefault,
              order: img.order || index,
            })),
          },
        } : undefined,
        inventory: {
          create: {
            stockQuantity: initialStock,
            reservedStock: 0,
          },
        },
      },
      include: {
        category: true,
        collections: true,
        images: true,
        inventory: true,
      },
    });
  }

  async update(id: string, data: UpdateProductInput) {
    const { images, categoryId, collectionId, collectionIds, ...fields } = data;

    const updateData: Prisma.ProductUpdateInput = {
      ...fields,
      ...(categoryId && { category: { connect: { id: categoryId } } }),
    };

    if (collectionIds !== undefined || collectionId !== undefined) {
      const targetIds: string[] = [];
      if (collectionIds && Array.isArray(collectionIds)) {
        targetIds.push(...collectionIds);
      }
      if (collectionId && !targetIds.includes(collectionId)) {
        targetIds.push(collectionId);
      }

      updateData.collections = {
        set: targetIds.map(colId => ({ id: colId })),
      };
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        collections: true,
        images: true,
        inventory: true,
      },
    });
  }

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isDeleted: true, status: 'ARCHIVED' },
    });
  }

  async hasAssociatedOrders(id: string): Promise<boolean> {
    const count = await prisma.orderItem.count({
      where: { productId: id },
    });
    return count > 0;
  }
}

export const productRepository = new ProductRepository();
