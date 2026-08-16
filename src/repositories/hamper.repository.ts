import { prisma } from '@/lib/prisma';
import { HamperPricingMode, Prisma } from '@prisma/client';

export interface CreateHamperInput {
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  collectionId?: string;
  price: number;
  comparePrice?: number;
  status?: string;
  featured?: boolean;
  isHamper?: boolean;
  hamperType?: string;
  pricingMode?: HamperPricingMode;
  startingPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  images?: string[];

  // Cost components (Internal Admin fields)
  costChocolate?: number;
  costPackaging?: number;
  costPersonalization?: number;
  costAssembly?: number;
  costOther?: number;
  costDelivery?: number;
  margin?: number;
  suggestedSellingPrice?: number;

  // Customization options
  allowChocolateSelection?: boolean;
  allowPersonalizedMessage?: boolean;
  allowCustomPackaging?: boolean;
  allowCustomRibbon?: boolean;
  allowCustomBranding?: boolean;
  allowCorporateBranding?: boolean;

  // Pricing Tiers
  pricingTiers?: Array<{
    minQuantity: number;
    maxQuantity?: number;
    unitPrice: number;
    isActive?: boolean;
  }>;
}

export class HamperRepository {
  /**
   * Remove internal admin cost components and margin data for customer safety
   */
  sanitizeForCustomer(hamper: any) {
    if (!hamper) return null;
    const {
      costChocolate,
      costPackaging,
      costPersonalization,
      costAssembly,
      costOther,
      costDelivery,
      margin,
      suggestedSellingPrice,
      ...safeHamper
    } = hamper;

    return safeHamper;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    hamperType?: string;
    pricingMode?: HamperPricingMode;
    status?: string;
    search?: string;
    isAdmin?: boolean;
  }) {
    const { skip = 0, take = 50, hamperType, pricingMode, status = 'ACTIVE', search, isAdmin = false } = params;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      isHamper: true,
      ...(status && status !== 'ALL' ? { status } : {}),
      ...(hamperType && hamperType !== 'ALL' ? { hamperType } : {}),
      ...(pricingMode ? { pricingMode } : {}),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { hamperType: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const hampers = await prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        collections: true,
        images: { orderBy: { order: 'asc' } },
        pricingTiers: { where: { isActive: true }, orderBy: { minQuantity: 'asc' } },
        _count: { select: { quoteRequests: true } },
      },
    });

    if (isAdmin) {
      return hampers;
    }

    return hampers.map((h) => this.sanitizeForCustomer(h));
  }

  async findById(id: string, isAdmin = false) {
    const hamper = await prisma.product.findFirst({
      where: { id, isDeleted: false, isHamper: true },
      include: {
        category: true,
        collections: true,
        images: { orderBy: { order: 'asc' } },
        pricingTiers: { orderBy: { minQuantity: 'asc' } },
        inventory: true,
      },
    });

    if (!hamper) return null;
    return isAdmin ? hamper : this.sanitizeForCustomer(hamper);
  }

  async findBySlug(slug: string, isAdmin = false) {
    const hamper = await prisma.product.findFirst({
      where: { slug: { equals: slug, mode: 'insensitive' }, isDeleted: false, isHamper: true },
      include: {
        category: true,
        collections: true,
        images: { orderBy: { order: 'asc' } },
        pricingTiers: { where: { isActive: true }, orderBy: { minQuantity: 'asc' } },
      },
    });

    if (!hamper) return null;
    return isAdmin ? hamper : this.sanitizeForCustomer(hamper);
  }

  async create(data: CreateHamperInput) {
    const { pricingTiers, images = [], ...fields } = data;

    const hamper = await prisma.product.create({
      data: {
        ...fields,
        isHamper: true,
        price: fields.price ?? 0,
        pricingMode: fields.pricingMode ?? HamperPricingMode.FIXED_PRICE,
        images: {
          create: images.map((url, idx) => ({
            url,
            isDefault: idx === 0,
            order: idx,
          })),
        },
        pricingTiers: pricingTiers
          ? {
              create: pricingTiers.map((t) => ({
                minQuantity: t.minQuantity,
                maxQuantity: t.maxQuantity ?? null,
                unitPrice: t.unitPrice,
                isActive: t.isActive ?? true,
              })),
            }
          : undefined,
        inventory: {
          create: {
            stockQuantity: 100,
            reorderLevel: 5,
          },
        },
      },
      include: {
        category: true,
        images: true,
        pricingTiers: true,
      },
    });

    return hamper;
  }

  async update(id: string, data: Partial<CreateHamperInput>) {
    const { pricingTiers, images, ...fields } = data;

    // Execute update transaction
    const hamper = await prisma.$transaction(async (tx) => {
      // 1. Update main hamper product fields
      await tx.product.update({
        where: { id },
        data: {
          ...fields,
          isHamper: true,
        },
      });

      // 2. Update pricing tiers if provided
      if (pricingTiers !== undefined) {
        await tx.hamperPricingTier.deleteMany({ where: { productId: id } });
        if (pricingTiers.length > 0) {
          await tx.hamperPricingTier.createMany({
            data: pricingTiers.map((t) => ({
              productId: id,
              minQuantity: t.minQuantity,
              maxQuantity: t.maxQuantity ?? null,
              unitPrice: t.unitPrice,
              isActive: t.isActive ?? true,
            })),
          });
        }
      }

      // 3. Update images if provided
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((url, idx) => ({
              productId: id,
              url,
              isDefault: idx === 0,
              order: idx,
            })),
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: true,
          pricingTiers: true,
        },
      });
    });

    return hamper;
  }

  async delete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}

export const hamperRepository = new HamperRepository();
