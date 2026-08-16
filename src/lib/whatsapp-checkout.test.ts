import { describe, it, expect } from 'vitest';
import { whatsappService } from '@/services/whatsapp.service';
import { createCheckoutSchema } from '@/validators/order.validator';

describe('Phase-1 WhatsApp Checkout Tests', () => {
  it('should normalize phone numbers to E.164 standard without spaces/symbols', () => {
    expect(whatsappService.normalizePhoneNumber('+91 98765 00000')).toBe('919876500000');
    expect(whatsappService.normalizePhoneNumber('98765-00000')).toBe('919876500000');
  });

  it('should generate properly structured and encoded WhatsApp deep links', () => {
    const link = whatsappService.generateOrderDeepLink({
      orderNumber: 'THF-2026-981024',
      items: [
        { productName: 'Dark Chocolate Box', quantity: 2, unitPrice: 499 },
        { productName: 'Signature Box', quantity: 1, unitPrice: 899 },
      ],
      giftWrap: false,
      totalAmount: 1897,
      businessPhone: '919061107915',
    });

    expect(link).toContain('https://wa.me/919061107915?text=');
    const decodedText = decodeURIComponent(link.split('text=')[1]);

    expect(decodedText).toContain('Order: #THF-2026-981024');
    expect(decodedText).toContain('Dark Chocolate Box');
    expect(decodedText).toContain('2 × ₹499');
    expect(decodedText).toContain('Order Total: ₹1,897');
    expect(decodedText).toContain('Please confirm my order and share the payment details.');
  });

  it('should validate customer checkout input correctly', () => {
    const validData = {
      customerName: 'Ananya Sharma',
      phone: '9876543210',
      street: '12 Luxury Boulevard',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      giftWrap: true,
      giftMessage: 'With compliments',
      items: [{ productId: 'thalf-001', quantity: 2 }],
    };

    const parsed = createCheckoutSchema.parse(validData);
    expect(parsed.customerName).toBe('Ananya Sharma');
    expect(parsed.items.length).toBe(1);
  });

  it('should reject checkout requests with missing pincode or invalid phone', () => {
    const invalidData = {
      customerName: 'A',
      phone: '123',
      street: 'St',
      city: 'M',
      state: 'M',
      postalCode: '123',
      items: [],
    };

    expect(() => createCheckoutSchema.parse(invalidData)).toThrow();
  });
});
