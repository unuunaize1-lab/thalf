import { prisma } from '@/lib/prisma';

export interface CreateProductImageInput {
  productId: string;
  url: string;
  publicId?: string;
  alt?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  isDefault?: boolean;
  order?: number;
}

export class MediaRepository {
  /**
   * Find product image by ID
   */
  static async findById(imageId: string) {
    return prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true },
    });
  }

  /**
   * Find all images for a product sorted by order
   */
  static async findByProductId(productId: string) {
    return prisma.productImage.findMany({
      where: { productId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Create new ProductImage record
   */
  static async createImage(data: CreateProductImageInput) {
    return prisma.productImage.create({
      data: {
        productId: data.productId,
        url: data.url,
        publicId: data.publicId,
        alt: data.alt || 'THALF Artisanal Product Image',
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
        isDefault: data.isDefault ?? false,
        order: data.order ?? 0,
      },
    });
  }

  /**
   * Atomically set an image as primary (isDefault = true), setting others to false
   */
  static async setPrimaryImage(productId: string, imageId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Reset all images for product to isDefault = false
      await tx.productImage.updateMany({
        where: { productId },
        data: { isDefault: false },
      });

      // 2. Set targeted image to isDefault = true
      return tx.productImage.update({
        where: { id: imageId },
        data: { isDefault: true },
      });
    });
  }

  /**
   * Update sort order for gallery images
   */
  static async updateImageOrders(productId: string, imageOrders: { id: string; order: number }[]) {
    return prisma.$transaction(
      imageOrders.map((item) =>
        prisma.productImage.updateMany({
          where: { id: item.id, productId },
          data: { order: item.order },
        })
      )
    );
  }

  /**
   * Update image alt text
   */
  static async updateAltText(imageId: string, altText: string) {
    return prisma.productImage.update({
      where: { id: imageId },
      data: { alt: altText },
    });
  }

  /**
   * Delete ProductImage record with primary fallback logic
   */
  static async deleteImage(imageId: string, productId: string) {
    return prisma.$transaction(async (tx) => {
      const targetImage = await tx.productImage.findFirst({
        where: { id: imageId, productId },
      });

      if (!targetImage) {
        throw new Error('Product image record not found or does not belong to this product.');
      }

      const isWasPrimary = targetImage.isDefault;

      // Delete target DB record
      await tx.productImage.delete({
        where: { id: imageId },
      });

      // If deleted image was primary, assign primary flag to first remaining image
      if (isWasPrimary) {
        const firstRemaining = await tx.productImage.findFirst({
          where: { productId },
          orderBy: { order: 'asc' },
        });

        if (firstRemaining) {
          await tx.productImage.update({
            where: { id: firstRemaining.id },
            data: { isDefault: true },
          });
        }
      }

      return targetImage;
    });
  }

  /**
   * General Media model operations for Admin Media Vault
   */
  static async findAllMedia() {
    return prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findMediaById(id: string) {
    return prisma.media.findUnique({
      where: { id },
    });
  }

  static async createMediaAsset(data: { filename: string; url: string; mimeType: string; size: number }) {
    return prisma.media.create({
      data,
    });
  }

  static async deleteMediaAsset(id: string) {
    return prisma.media.delete({
      where: { id },
    });
  }
}
