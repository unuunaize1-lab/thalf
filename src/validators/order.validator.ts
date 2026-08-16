import { z } from 'zod';

export const createCheckoutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Maximum 20 items per product'),
});

export const createCheckoutSchema = z.object({
  customerName: z.string().min(2, 'Full name is required').max(100),
  phone: z.string().min(10, 'Valid 10-digit mobile number is required').max(15),
  customerEmail: z.string().email().optional().or(z.literal('')),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(6, 'Valid 6-digit pincode is required').max(6),
  country: z.string().default('India'),
  deliveryNotes: z.string().optional(),
  giftWrap: z.boolean().default(false),
  giftMessage: z.string().optional(),
  giftRibbon: z.string().optional(),
  couponCode: z.string().optional(),
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
