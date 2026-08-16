import { describe, it, expect } from 'vitest';
import { PricingEngine, formatCurrency, PRICING_CONFIG } from './pricing';
import { CartItem, Coupon } from '@/types';

describe('Pricing Engine', () => {
  const mockItems: CartItem[] = [
    {
      productId: 'p1',
      productName: 'Dark Truffle Box',
      price: 600,
      quantity: 2,
      sku: 'THF-TRF-001',
      image: 'truffle.jpg',
    }, // Subtotal: 1200
  ];

  it('calculates base order values correctly without options', () => {
    const result = PricingEngine.calculateOrder(mockItems);
    expect(result.subtotal).toBe(1200);
    expect(result.itemDiscounts).toBe(0);
    expect(result.couponDiscount).toBe(0);
    expect(result.taxableAmount).toBe(1200);
    expect(result.shippingFee).toBe(PRICING_CONFIG.defaultShippingFee); // 150 INR since < 1500
    expect(result.giftWrapFee).toBe(0);
    expect(result.total).toBe(1350); // 1200 + 150
  });

  it('calculates free shipping when subtotal exceeds threshold', () => {
    const highValueItems: CartItem[] = [
      ...mockItems,
      {
        productId: 'p2',
        productName: 'Grand Selection Box',
        price: 800,
        quantity: 1,
        sku: 'THF-GRD-001',
        image: 'grand.jpg',
      }, // Subtotal: 1200 + 800 = 2000
    ];
    const result = PricingEngine.calculateOrder(highValueItems);
    expect(result.subtotal).toBe(2000);
    expect(result.shippingFee).toBe(0); // Free shipping (>= 1500)
    expect(result.total).toBe(2000);
  });

  it('ensures gift wrapping fee is 0', () => {
    const result = PricingEngine.calculateOrder(mockItems);
    expect(result.giftWrapFee).toBe(0);
    expect(result.total).toBe(1350);
  });

  it('applies percentage discount coupon successfully', () => {
    const coupon: Coupon = {
      code: 'TASTE10',
      type: 'percentage',
      value: 10,
      minOrderValue: 500,
      usageCount: 0,
      expiryDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const result = PricingEngine.calculateOrder(mockItems, coupon);
    expect(result.couponDiscount).toBe(120); // 10% of 1200
    expect(result.taxableAmount).toBe(1080);
    expect(result.shippingFee).toBe(PRICING_CONFIG.defaultShippingFee); // 150 since 1080 < 1500
    expect(result.total).toBe(1230); // 1080 + 150
  });

  it('applies fixed-amount coupon successfully', () => {
    const coupon: Coupon = {
      code: 'WELCOME200',
      type: 'fixed',
      value: 200,
      minOrderValue: 1000,
      usageCount: 0,
      expiryDate: new Date(Date.now() + 86400000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const result = PricingEngine.calculateOrder(mockItems, coupon);
    expect(result.couponDiscount).toBe(200); // flat 200
    expect(result.taxableAmount).toBe(1000);
    expect(result.total).toBe(1150); // 1000 + 150
  });

  it('rejects coupon below minimum order value threshold', () => {
    const coupon: Coupon = {
      code: 'BIGDISCOUNT',
      type: 'fixed',
      value: 300,
      minOrderValue: 2000, // Requires 2000, we only have 1200
      usageCount: 0,
      expiryDate: new Date(Date.now() + 86400000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const result = PricingEngine.calculateOrder(mockItems, coupon);
    expect(result.couponDiscount).toBe(0); // Ignored
    expect(result.total).toBe(1350);
  });

  it('rejects expired coupon', () => {
    const coupon: Coupon = {
      code: 'EXPIRED100',
      type: 'fixed',
      value: 100,
      minOrderValue: 500,
      usageCount: 0,
      expiryDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const result = PricingEngine.calculateOrder(mockItems, coupon);
    expect(result.couponDiscount).toBe(0); // Expired
    expect(result.total).toBe(1350);
  });

  it('formats currency representation properly in en-IN', () => {
    const amount = 1250.5;
    const formatted = formatCurrency(amount);
    // Replace non-breaking spaces with standard space for matching tests
    const normalized = formatted.replace(/\u00a0/g, ' ');
    expect(normalized).toContain('₹');
    expect(normalized).toContain('1,250.50');
  });
});
