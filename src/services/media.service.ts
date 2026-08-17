import { CloudinaryService, CloudinaryUploadResult } from './cloudinary.service';
import { MediaRepository } from '@/repositories/media.repository';
import { productRepository } from '@/repositories/product.repository';
import { auditService } from './audit.service';
import { prisma } from '@/lib/prisma';
import fs from 'node:fs/promises';
import path from 'node:path';

async function saveFileLocally(buffer: Buffer, fileName: string): Promise<{ url: string; filename: string }> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(fileName) || '.png';
  const cleanBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeName = `${cleanBase}_${Date.now()}${ext}`;
  const filePath = path.join(uploadDir, safeName);

  await fs.writeFile(filePath, buffer);
  return {
    url: `/uploads/${safeName}`,
    filename: safeName,
  };
}

export class MediaService {
  /**
   * Get all media assets from Media library table (with auto-seeding default assets if empty)
   */
  static async getAllMedia() {
    let mediaList = await MediaRepository.findAllMedia();

    if (mediaList.length === 0) {
      const initialAssets = [
        {
          filename: 'date-chocolate.jpeg',
          url: '/images/choclates/date-chocolate.jpeg',
          mimeType: 'image/jpeg',
          size: 55087,
        },
        {
          filename: 'dates-chocolate.jpeg',
          url: '/images/choclates/dates-chocolate.jpeg',
          mimeType: 'image/jpeg',
          size: 47222,
        },
        {
          filename: 'kunafa-pistachio.jpeg',
          url: '/images/choclates/kunafa-pistachio.jpeg',
          mimeType: 'image/jpeg',
          size: 47771,
        },
        {
          filename: 'lollypop.jpeg',
          url: '/images/choclates/lollypop.jpeg',
          mimeType: 'image/jpeg',
          size: 47919,
        },
        {
          filename: 'rock-chocolate.jpeg',
          url: '/images/choclates/rock-chocolate.jpeg',
          mimeType: 'image/jpeg',
          size: 54692,
        },
      ];

      for (const asset of initialAssets) {
        await MediaRepository.createMediaAsset(asset);
      }
      mediaList = await MediaRepository.findAllMedia();
    }

    return mediaList;
  }

  /**
   * Upload general media asset or product image with Cloudinary + Local Disk fallback
   */
  static async uploadMediaAsset(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    productId?: string,
    actorId?: string,
    altText?: string
  ) {
    let fileUrl = '';
    let publicId: string | undefined;
    let bytes = buffer.length;

    // Try Cloudinary upload if configured
    try {
      const cloudResult = await CloudinaryService.uploadProductImage(buffer, fileName, mimeType, productId || 'media');
      fileUrl = cloudResult.secureUrl;
      publicId = cloudResult.publicId;
      bytes = cloudResult.bytes || buffer.length;
    } catch (err: any) {
      // Fallback to local file storage on disk
      const localResult = await saveFileLocally(buffer, fileName);
      fileUrl = localResult.url;
    }

    // 1. Create Media vault record
    const mediaRecord = await MediaRepository.createMediaAsset({
      filename: fileName,
      url: fileUrl,
      mimeType,
      size: bytes,
    });

    // 2. If valid product ID is provided, also create ProductImage record
    let productImageRecord;
    if (productId && !productId.startsWith('new-') && productId !== 'general') {
      const product = await productRepository.findById(productId);
      if (product && !product.isDeleted) {
        const existingImages = await MediaRepository.findByProductId(productId);
        productImageRecord = await MediaRepository.createImage({
          productId,
          url: fileUrl,
          publicId,
          alt: altText || `${product.name} Image`,
          bytes,
          isDefault: existingImages.length === 0,
          order: existingImages.length,
        });
      }
    }

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'UPLOAD_MEDIA_ASSET',
        entity: 'Media',
        entityId: mediaRecord.id,
        details: { filename: fileName, url: fileUrl, productId },
      });
    }

    return {
      media: mediaRecord,
      productImage: productImageRecord,
    };
  }

  /**
   * Upload image file specifically for a product
   */
  static async uploadProductImage(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    productId: string,
    actorId: string,
    altText?: string
  ) {
    const result = await this.uploadMediaAsset(buffer, fileName, mimeType, productId, actorId, altText);
    if (result.productImage) {
      return result.productImage;
    }
    return {
      id: result.media.id,
      productId: productId || '',
      url: result.media.url,
      alt: altText || fileName,
      isDefault: true,
      order: 0,
      createdAt: result.media.createdAt,
    };
  }

  /**
   * Delete media asset from Media library or ProductImage table
   */
  static async deleteMediaAsset(id: string, actorId: string) {
    // 1. Check Media model
    const mediaRecord = await MediaRepository.findMediaById(id);
    if (mediaRecord) {
      if (mediaRecord.url.startsWith('/uploads/')) {
        const localPath = path.join(process.cwd(), 'public', mediaRecord.url);
        try {
          await fs.unlink(localPath);
        } catch (err) {
          // ignore if file absent
        }
      }
      await MediaRepository.deleteMediaAsset(id);

      if (actorId) {
        await auditService.log(prisma, {
          userId: actorId,
          action: 'DELETE_MEDIA_ASSET',
          entity: 'Media',
          entityId: id,
          details: { url: mediaRecord.url, filename: mediaRecord.filename },
        });
      }
      return { success: true, deletedId: id };
    }

    // 2. Check ProductImage model
    const imageRecord = await MediaRepository.findById(id);
    if (imageRecord) {
      if (imageRecord.url.startsWith('/uploads/')) {
        const localPath = path.join(process.cwd(), 'public', imageRecord.url);
        try {
          await fs.unlink(localPath);
        } catch (err) {
          // ignore if file absent
        }
      }
      const deleted = await MediaRepository.deleteImage(id, imageRecord.productId);
      if (deleted.publicId) {
        await CloudinaryService.deleteImage(deleted.publicId);
      }
      return { success: true, deletedId: id };
    }

    throw new Error(`Media asset with ID '${id}' not found.`);
  }

  /**
   * Delete product image cleanly from Cloudinary and DB
   */
  static async deleteProductImage(imageId: string, productId: string, actorId: string) {
    return this.deleteMediaAsset(imageId, actorId);
  }

  /**
   * Set primary image for product
   */
  static async setPrimaryImage(imageId: string, productId: string, actorId: string) {
    const existingImage = await MediaRepository.findById(imageId);
    if (!existingImage || existingImage.productId !== productId) {
      throw new Error(`Image record '${imageId}' does not belong to product '${productId}'.`);
    }

    const updatedImage = await MediaRepository.setPrimaryImage(productId, imageId);

    await auditService.log(prisma, {
      userId: actorId,
      action: 'SET_PRIMARY_PRODUCT_IMAGE',
      entity: 'ProductImage',
      entityId: imageId,
      details: { productId },
    });

    return updatedImage;
  }

  /**
   * Reorder gallery images
   */
  static async reorderGallery(productId: string, imageOrders: { id: string; order: number }[], actorId: string) {
    await MediaRepository.updateImageOrders(productId, imageOrders);

    await auditService.log(prisma, {
      userId: actorId,
      action: 'REORDER_PRODUCT_GALLERY',
      entity: 'Product',
      entityId: productId,
      details: { imageCount: imageOrders.length },
    });

    return { success: true };
  }
}
