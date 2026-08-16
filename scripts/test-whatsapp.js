const { WhatsAppNotificationService } = require('../src/services/whatsapp-notification.service');

async function runTests() {
  console.log('--- Testing WhatsAppNotificationService ---');
  const service = new WhatsAppNotificationService();

  const mockOrder = {
    id: 'test_ord_1',
    orderNumber: 'THF-2026-100200',
    customerName: 'Priya Sundaram',
    customerPhone: '+91 98765 12345',
    street: '45 MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India',
    subtotal: 2400,
    shippingAmount: 150,
    totalAmount: 2550,
    whatsappNotificationStatus: 'PENDING',
    orderItems: [
      { productName: 'Artisanal Bonbons Pack of 12', quantity: 2 },
      { productName: 'Dark Sea Salt Slab', quantity: 1 },
    ],
    payment: { status: 'UNPAID' },
  };

  const message = service.buildOrderMessage(mockOrder);
  console.log('\n[Generated Message Output]:\n');
  console.log(message);
  console.log('\n----------------------------------------');

  // Validations
  const checks = [
    { title: 'Header Present', valid: message.includes('🍫 NEW THALF ORDER') },
    { title: 'Order Number Correct', valid: message.includes('THF-2026-100200') },
    { title: 'Customer Name Correct', valid: message.includes('Priya Sundaram') },
    { title: 'Customer Phone Correct', valid: message.includes('+91 98765 12345') },
    { title: 'Item 1 Quantity & Name', valid: message.includes('Artisanal Bonbons Pack of 12 × 2') },
    { title: 'Item 2 Quantity & Name', valid: message.includes('Dark Sea Salt Slab × 1') },
    { title: 'Subtotal Correct', valid: message.includes('Subtotal: ₹2,400') },
    { title: 'Shipping Correct', valid: message.includes('Shipping: ₹150') },
    { title: 'Total Amount Correct', valid: message.includes('Total: ₹2,550') },
    { title: 'Payment Status', valid: message.includes('Payment:\nUNPAID') },
    { title: 'Delivery Info Correct', valid: message.includes('45 MG Road, Bengaluru, Karnataka, 560001, India') },
    { title: 'Admin Callout Present', valid: message.includes('Please check the Admin Panel for the complete order.') },
  ];

  let passed = true;
  checks.forEach((c) => {
    if (c.valid) {
      console.log(`✓ ${c.title}`);
    } else {
      console.error(`❌ FAILED: ${c.title}`);
      passed = false;
    }
  });

  if (!passed) {
    console.error('\nWhatsApp Notification Service Test Failed!');
    process.exit(1);
  }

  console.log('\nAll WhatsApp Notification Service Tests PASSED successfully!');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
