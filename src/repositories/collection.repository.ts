import { prisma } from '@/lib/prisma';

export interface CreateCollectionInput {
  name: string;
  slug: string;
  description?: string | null;
  bannerImage?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  productIds?: string[];
}

export interface UpdateCollectionInput {
  name?: string;
  slug?: string;
  description?: string | null;
  bannerImage?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  productIds?: string[];
}

export class CollectionRepository {
  async findMany() {
    const collections = await prisma.collection.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        products: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            price: true,
            status: true,
            images: true,
          },
        },
        _count: {
          select: { products: { where: { isDeleted: false } } },
        },
      },
    });

    return collections.map(col => ({
      ...col,
      productCount: col._count.products,
    }));
  }

  /**
   * Fetch active seasonal festival collections for storefront display.
   * Filter rules:
   * - isActive === true
   * - startDate is null OR startDate <= NOW
   * - endDate is null OR endDate >= NOW
   */
  async findActiveFestivalCollections(now: Date = new Date()) {
    const collections = await prisma.collection.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        products: {
          where: {
            status: 'ACTIVE',
            isDeleted: false,
          },
          include: {
            images: { orderBy: { order: 'asc' } },
            category: true,
            inventory: true,
          },
        },
      },
    });

    return collections;
  }

  async findById(id: string) {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          where: { isDeleted: false },
          include: {
            images: { orderBy: { order: 'asc' } },
            category: true,
            inventory: true,
          },
        },
      },
    });

    if (!collection) return null;
    return {
      ...collection,
      productCount: collection.products.length,
    };
  }

  async findBySlug(slug: string) {
    return prisma.collection.findFirst({
      where: { slug: { equals: slug, mode: 'insensitive' } },
      include: {
        products: {
          where: { isDeleted: false, status: 'ACTIVE' },
          include: {
            images: { orderBy: { order: 'asc' } },
            category: true,
            inventory: true,
          },
        },
      },
    });
  }

  async create(data: CreateCollectionInput) {
    const { productIds, startDate, endDate, ...fields } = data;

    return prisma.collection.create({
      data: {
        name: fields.name,
        slug: fields.slug,
        description: fields.description || null,
        bannerImage: fields.bannerImage || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: fields.isActive !== undefined ? fields.isActive : true,
        isFeatured: fields.isFeatured !== undefined ? fields.isFeatured : false,
        displayOrder: fields.displayOrder ?? 0,
        ...(productIds && productIds.length > 0 && {
          products: {
            connect: productIds.map(id => ({ id })),
          },
        }),
      },
      include: {
        products: {
          where: { isDeleted: false },
          select: { id: true, name: true, sku: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateCollectionInput) {
    const { productIds, startDate, endDate, ...fields } = data;

    const updateData: any = {
      ...(fields.name !== undefined && { name: fields.name }),
      ...(fields.slug !== undefined && { slug: fields.slug }),
      ...(fields.description !== undefined && { description: fields.description || null }),
      ...(fields.bannerImage !== undefined && { bannerImage: fields.bannerImage || null }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(fields.isActive !== undefined && { isActive: fields.isActive }),
      ...(fields.isFeatured !== undefined && { isFeatured: fields.isFeatured }),
      ...(fields.displayOrder !== undefined && { displayOrder: fields.displayOrder }),
    };

    if (productIds !== undefined) {
      updateData.products = {
        set: productIds.map(prodId => ({ id: prodId })),
      };
    }

    return prisma.collection.update({
      where: { id },
      data: updateData,
      include: {
        products: {
          where: { isDeleted: false },
          select: { id: true, name: true, sku: true },
        },
      },
    });
  }

  async delete(id: string) {
    // Delete collection record without deleting associated products
    return prisma.collection.delete({
      where: { id },
    });
  }
}

export const collectionRepository = new CollectionRepository();
