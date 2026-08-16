import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '@/config/env';

// Configure Cloudinary SDK instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class CloudinaryService {
  /**
   * Validate MIME type and max file size
   */
  static validateImageFile(buffer: Buffer, mimeType: string): { valid: boolean; error?: string } {
    if (!buffer || buffer.length === 0) {
      return { valid: false, error: 'Empty file payload provided.' };
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: `File size exceeds maximum allowed threshold of 10MB. (Received ${(buffer.length / (1024 * 1024)).toFixed(2)}MB)` };
    }

    const normalizedMime = mimeType ? mimeType.toLowerCase().trim() : '';
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(normalizedMime)) {
      return { valid: false, error: `Unsupported image format (${mimeType}). Allowed formats: JPEG, PNG, WebP, AVIF.` };
    }

    // Additional security check against SVG and HTML payload injection
    const headerStr = buffer.slice(0, 100).toString('utf8').toLowerCase();
    if (headerStr.includes('<svg') || headerStr.includes('<script') || headerStr.includes('<html>') || headerStr.includes('<!doctype')) {
      return { valid: false, error: 'Security violation: Executable or script payload detected in image buffer.' };
    }

    return { valid: true };
  }

  /**
   * Upload image buffer to Cloudinary under structured folder: thalf/products/{productId}/
   */
  static async uploadProductImage(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    productId: string
  ): Promise<CloudinaryUploadResult> {
    const validation = this.validateImageFile(buffer, mimeType);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image file.');
    }

    // Sanitize productId to prevent path traversal
    const safeProductId = productId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!safeProductId) {
      throw new Error('Invalid productId provided for Cloudinary storage path.');
    }

    const folderPath = `thalf/products/${safeProductId}`;
    const baseFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          use_filename: true,
          unique_filename: true,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ],
        },
        (error: any, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(new Error(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`));
          }
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Delete asset from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    if (!publicId) return false;

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok' || result.result === 'not found';
    } catch (err: any) {
      console.error('Cloudinary deletion failed:', err?.message || err);
      return false;
    }
  }

  /**
   * Helper to build responsive Cloudinary transformed URL
   */
  static getTransformedUrl(
    secureUrl: string,
    options: { width?: number; height?: number; crop?: string; quality?: string } = {}
  ): string {
    if (!secureUrl || !secureUrl.includes('res.cloudinary.com')) {
      return secureUrl;
    }

    const { width, height, crop = 'fill', quality = 'auto' } = options;
    const transformParts = [`f_auto`, `q_${quality}`];
    if (width) transformParts.push(`w_${width}`);
    if (height) transformParts.push(`h_${height}`);
    if (width || height) transformParts.push(`c_${crop}`);

    const transformStr = transformParts.join(',');
    return secureUrl.replace('/upload/', `/upload/${transformStr}/`);
  }
}
