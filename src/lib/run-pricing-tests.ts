import assert from 'node:assert';
import { PricingEngine, formatCurrency, PRICING_CONFIG } from './pricing.js';
import { CartItem, Coupon } from '../types/index.js';

const mockItems: CartItem[] = [
  {
    productId: 'p1',
    productName: 'Dark Truffle Box',
    price: 600,
    quantity: 2,
    sku: 'THF-TRF-001',
    image: 'truffle.jpg',
  },
];

console.log('--- RUNNING PRICING ENGINE TESTS ---');

// Test Case 1: Base Calculations
try {
  const result = PricingEngine.calculateOrder(mockItems);
  assert.strictEqual(result.subtotal, 1200);
  assert.strictEqual(result.itemDiscounts, 0);
  assert.strictEqual(result.couponDiscount, 0);
  assert.strictEqual(result.taxableAmount, 1200);
  assert.strictEqual(result.shippingFee, PRICING_CONFIG.defaultShippingFee);
  assert.strictEqual(result.giftWrapFee, 0);
  assert.strictEqual(result.total, 1350);
  console.log('✓ Test Case 1: Base calculations passed.');
} catch (err) {
  console.error('✗ Test Case 1 Failed:', err);
  process.exit(1);
}

// Test Case 2: Free Shipping Threshold
try {
  const highValueItems: CartItem[] = [
    ...mockItems,
    {
      productId: 'p2',
      productName: 'Grand Selection Box',
      price: 800,
      quantity: 1,
      sku: 'THF-GRD-001',
      image: 'grand.jpg',
    },
  ];
  const result = PricingEngine.calculateOrder(highValueItems);
  assert.strictEqual(result.subtotal, 2000);
  assert.strictEqual(result.shippingFee, 0);
  assert.strictEqual(result.total, 2000);
  console.log('✓ Test Case 2: Free shipping threshold passed.');
} catch (err) {
  console.error('✗ Test Case 2 Failed:', err);
  process.exit(1);
}

// Test Case 3: No Gift Wrap Surcharge
try {
  const result = PricingEngine.calculateOrder(mockItems, null);
  assert.strictEqual(result.giftWrapFee, 0);
  assert.strictEqual(result.total, 1350);
  console.log('✓ Test Case 3: Gift wrap fee is 0 as expected.');
} catch (err) {
  console.error('✗ Test Case 3 Failed:', err);
  process.exit(1);
}

// Test Case 4: Percentage Coupon
try {
  const coupon: Coupon = {
    code: 'TASTE10',
    type: 'percentage',
    value: 10,
    minOrderValue: 500,
    usageCount: 0,
    expiryDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  const result = PricingEngine.calculateOrder(mockItems, coupon);
  assert.strictEqual(result.couponDiscount, 120);
  assert.strictEqual(result.taxableAmount, 1080);
  assert.strictEqual(result.shippingFee, PRICING_CONFIG.defaultShippingFee);
  assert.strictEqual(result.total, 1230);
  console.log('✓ Test Case 4: Percentage coupon passed.');
} catch (err) {
  console.error('✗ Test Case 4 Failed:', err);
  process.exit(1);
}

// Test Case 5: Fixed Amount Coupon
try {
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
  assert.strictEqual(result.couponDiscount, 200);
  assert.strictEqual(result.taxableAmount, 1000);
  assert.strictEqual(result.total, 1150);
  console.log('✓ Test Case 5: Fixed amount coupon passed.');
} catch (err) {
  console.error('✗ Test Case 5 Failed:', err);
  process.exit(1);
}

// Test Case 6: Coupon Minimum Order Threshold
try {
  const coupon: Coupon = {
    code: 'BIGDISCOUNT',
    type: 'fixed',
    value: 300,
    minOrderValue: 2000,
    usageCount: 0,
    expiryDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  const result = PricingEngine.calculateOrder(mockItems, coupon);
  assert.strictEqual(result.couponDiscount, 0);
  assert.strictEqual(result.total, 1350);
  console.log('✓ Test Case 6: Coupon threshold check passed.');
} catch (err) {
  console.error('✗ Test Case 6 Failed:', err);
  process.exit(1);
}

// Test Case 7: Expired Coupon
try {
  const coupon: Coupon = {
    code: 'EXPIRED100',
    type: 'fixed',
    value: 100,
    minOrderValue: 500,
    usageCount: 0,
    expiryDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  const result = PricingEngine.calculateOrder(mockItems, coupon);
  assert.strictEqual(result.couponDiscount, 0);
  assert.strictEqual(result.total, 1350);
  console.log('✓ Test Case 7: Expired coupon check passed.');
} catch (err) {
  console.error('✗ Test Case 7 Failed:', err);
  process.exit(1);
}

// Test Case 8: Currency Formatting
try {
  const amount = 1250.5;
  const formatted = formatCurrency(amount);
  const normalized = formatted.replace(/\u00a0/g, ' ');
  assert.ok(normalized.includes('₹'));
  assert.ok(normalized.includes('1,250.50') || normalized.includes('1,250.5'));
  console.log('✓ Test Case 8: Currency formatting passed.');
} catch (err) {
  console.error('✗ Test Case 8 Failed:', err);
  process.exit(1);
}

console.log('--- ALL PRICING ENGINE TESTS PASSED SUCCESSFULLY ---');
process.exit(0);
