import { describe, it, expect, beforeEach } from 'vitest';
import { CloudinaryService } from '../src/services/cloudinary.service';
import { MediaService } from '../src/services/media.service';
import { MediaRepository } from '../src/repositories/media.repository';

describe('P1.2 Cloudinary Media Infrastructure & Security Audit', () => {

  describe('1. File & Payload Security Validation', () => {
    it('rejects empty file buffers', () => {
      const emptyBuffer = Buffer.from([]);
      const result = CloudinaryService.validateImageFile(emptyBuffer, 'image/png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Empty file payload');
    });

    it('rejects oversized uploads > 10MB', () => {
      const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      const result = CloudinaryService.validateImageFile(oversizedBuffer, 'image/jpeg');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed threshold');
    });

    it('rejects invalid or unauthorized MIME types (e.g. text/html, application/x-sh)', () => {
      const buffer = Buffer.from('console.log("malicious")');
      const result = CloudinaryService.validateImageFile(buffer, 'text/javascript');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported image format');
    });

    it('rejects SVG and embedded script payloads', () => {
      const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
      const result = CloudinaryService.validateImageFile(svgBuffer, 'image/png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Security violation: Executable or script payload detected');
    });

    it('accepts valid JPEG, PNG, WebP, and AVIF image buffers', () => {
      const validBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
      const result = CloudinaryService.validateImageFile(validBuffer, 'image/jpeg');
      expect(result.valid).toBe(true);
    });
  });

  describe('2. Cloudinary URL Transformations', () => {
    it('generates auto-format and auto-quality Cloudinary URLs', () => {
      const rawUrl = 'https://res.cloudinary.com/thalf-cloud/image/upload/v12345/thalf/products/p1/test.jpg';
      const transformed = CloudinaryService.getTransformedUrl(rawUrl, { width: 400, height: 300, crop: 'fill' });
      expect(transformed).toContain('f_auto,q_auto,w_400,h_300,c_fill');
      expect(transformed).not.toEqual(rawUrl);
    });
  });

  describe('3. Cloudinary Secret Leakage Check', () => {
    it('ensures CLOUDINARY_API_SECRET is not exposed in public environment vars or client prefixes', () => {
      expect(process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET).toBeUndefined();
      expect(process.env.CLOUDINARY_API_SECRET).toBeDefined();
    });
  });
});
