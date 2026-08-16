const { pushNotificationService } = require('../src/services/push-notification.service');

async function testPushDispatch() {
  console.log('--- Testing PushNotificationService Dispatch ---');
  
  const isConfigured = pushNotificationService.isConfigured();
  console.log('Is VAPID Configured:', isConfigured);
  console.log('Public Key:', pushNotificationService.getPublicKey());

  const result = await pushNotificationService.sendNewOrderNotification({
    id: 'test_order_push_123',
    orderNumber: 'THF-2026-000124',
    totalAmount: 1350,
  });

  console.log('Dispatch result:', result);
  console.log('--- PushNotificationService Test Completed ---');
}

testPushDispatch().catch(console.error);
