require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    target: 'es2017',
    esModuleInterop: true,
  },
});

const { whatsappService } = require('../src/services/whatsapp.service');
const { createCheckoutSchema } = require('../src/validators/order.validator');

console.log('=== RUNNING THALF PHASE-1 CHECKOUT UNIT TESTS ===');

// Test 1: Phone normalization
console.log('\n[Test 1] Testing Phone Normalization...');
const norm1 = whatsappService.normalizePhoneNumber('+91 98765 00000');
const norm2 = whatsappService.normalizePhoneNumber('98765-00000');
if (norm1 === '919876500000' && norm2 === '919876500000') {
  console.log('✓ PASS: Phone numbers normalized to E.164 without spaces/symbols');
} else {
  console.error(`✕ FAIL: Got norm1=${norm1}, norm2=${norm2}`);
  process.exit(1);
}

// Test 2: WhatsApp Deep Link generation
console.log('\n[Test 2] Testing WhatsApp Deep Link Formatting...');
const link = whatsappService.generateOrderDeepLink({
  orderNumber: 'THF-2026-981024',
  items: [
    { productName: 'Dark Chocolate Box', quantity: 2, unitPrice: 499 },
    { productName: 'Signature Gift Box', quantity: 1, unitPrice: 899 },
  ],
  giftWrap: true,
  giftMessage: 'Happy Birthday!',
  totalAmount: 1997,
  businessPhone: '+919876500000',
});

const decodedText = decodeURIComponent(link.split('text=')[1]);

if (
  link.startsWith('https://wa.me/919876500000?text=') &&
  decodedText.includes('Order: #THF-2026-981024') &&
  decodedText.includes('Dark Chocolate Box') &&
  decodedText.includes('2 × ₹499') &&
  decodedText.includes('Gift Wrap: Yes') &&
  decodedText.includes('Gift Message: Happy Birthday!') &&
  decodedText.includes('Order Total: ₹1,997') &&
  decodedText.includes('Please confirm my order and share the payment details.')
) {
  console.log('✓ PASS: WhatsApp deep link formatting matches exact specification');
} else {
  console.error('✕ FAIL: Deep link structure mismatch:', decodedText);
  process.exit(1);
}

// Test 3: Validation Schema
console.log('\n[Test 3] Testing Zod Checkout Input Validation...');
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

try {
  const parsed = createCheckoutSchema.parse(validData);
  if (parsed.customerName === 'Ananya Sharma' && parsed.items.length === 1) {
    console.log('✓ PASS: Checkout validation schema passed successfully');
  }
} catch (err) {
  console.error('✕ FAIL: Validation failed unexpectedly', err);
  process.exit(1);
}

console.log('\n=== ALL PHASE-1 UNIT TESTS PASSED SUCCESSFULLY (3/3) ===');
