import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  shortDescription: z.string().optional(),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().positive('Price must be greater than 0'),
  comparePrice: z.number().positive().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  cacaoPercentage: z.number().int().min(0).max(100).optional(),
  weight: z.string().optional(),
  ingredients: z.string().optional(),
  allergenInfo: z.string().optional(),
  flavourProfile: z.string().optional(),
  storageInstructions: z.string().optional(),
  shelfLife: z.string().optional(),
  tastingNotes: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  collectionId: z.string().optional(),
  collectionIds: z.array(z.string()).optional(),
  images: z.array(
    z.object({
      url: z.string().min(1, 'Image URL is required'),
      alt: z.string().optional(),
      isDefault: z.boolean().default(false),
      order: z.number().default(0),
    })
  ).default([]),
  initialStock: z.number().int().nonnegative().default(100),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.input<typeof createProductSchema>;
export type UpdateProductInput = z.input<typeof updateProductSchema>;
