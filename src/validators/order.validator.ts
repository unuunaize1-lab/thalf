import { z } from 'zod';

export const createCheckoutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Maximum 100 items per product'),
});

export const createCheckoutSchema = z.object({
  customerName: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().min(7, 'Valid phone number is required').max(20),
  customerEmail: z.string().email('Please enter a valid email address').or(z.literal('')).optional().nullable(),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(3, 'Valid pincode is required').max(10),
  country: z.string().optional().default('India'),
  deliveryNotes: z.string().optional().nullable(),
  giftWrap: z.boolean().optional().default(false),
  giftMessage: z.string().optional().nullable(),
  giftRibbon: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  items: z.array(createCheckoutItemSchema).min(1, 'Cart must contain at least one item'),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'PREPARING',
    'PACKED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ]),
  note: z.string().optional(),
});

export const markPaymentReceivedSchema = z.object({
  transactionRef: z.string().optional(),
  note: z.string().optional(),
});
