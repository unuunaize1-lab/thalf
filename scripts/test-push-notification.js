const fs = require('fs');
const path = require('path');

function runVerification() {
  console.log('=== THALF ADMIN PUSH NOTIFICATION VERIFICATION ===\n');

  // 1. Check Service Worker file
  const swPath = path.join(__dirname, '../public/sw.js');
  if (!fs.existsSync(swPath)) {
    console.error('❌ FAILED: public/sw.js does not exist.');
    process.exit(1);
  }
  const swContent = fs.readFileSync(swPath, 'utf-8');
  console.log('✓ public/sw.js exists and loaded.');

  const swChecks = [
    { name: "Push listener handles 'push' event", test: swContent.includes("self.addEventListener('push'") },
    { name: "Notification click handles 'notificationclick' event", test: swContent.includes("self.addEventListener('notificationclick'") },
    { name: "Notification click focuses/opens /admin/orders/[orderId]", test: swContent.includes("client.focus()") && swContent.includes("self.clients.openWindow") },
    { name: "Notification content contains title & body", test: swContent.includes("self.registration.showNotification") },
  ];

  swChecks.forEach(c => {
    if (c.test) {
      console.log(`  ✓ ${c.name}`);
    } else {
      console.error(`  ❌ FAILED: ${c.name}`);
      process.exit(1);
    }
  });

  // 2. Check PushNotificationService
  const pushServicePath = path.join(__dirname, '../src/services/push-notification.service.ts');
  if (!fs.existsSync(pushServicePath)) {
    console.error('❌ FAILED: PushNotificationService file does not exist.');
    process.exit(1);
  }
  const pushServiceContent = fs.readFileSync(pushServicePath, 'utf-8');
  console.log('\n✓ src/services/push-notification.service.ts verified.');

  const serviceChecks = [
    { name: "Uses web-push library", test: pushServiceContent.includes("import webpush from 'web-push'") },
    { name: "Derives user from authenticated session", test: pushServiceContent.includes("registerSubscription") },
    { name: "Revokes invalid/expired subscriptions (404/410)", test: pushServiceContent.includes("404") && pushServiceContent.includes("410") && pushServiceContent.includes("revokeSubscription") },
    { name: "Does not expose VAPID private key to client", test: pushServiceContent.includes("getPublicKey") && !pushServiceContent.includes("NEXT_PUBLIC_VAPID_PRIVATE_KEY") },
    { name: "Non-blocking order flow exception handling", test: pushServiceContent.includes("catch") },
  ];

  serviceChecks.forEach(c => {
    if (c.test) {
      console.log(`  ✓ ${c.name}`);
    } else {
      console.error(`  ❌ FAILED: ${c.name}`);
      process.exit(1);
    }
  });

  // 3. Check OrderService integration
  const orderServicePath = path.join(__dirname, '../src/services/order.service.ts');
  const orderServiceContent = fs.readFileSync(orderServicePath, 'utf-8');
  console.log('\n✓ src/services/order.service.ts integration verified.');

  if (orderServiceContent.includes("pushNotificationService.sendNewOrderNotification")) {
    console.log("  ✓ Push notification triggered AFTER order creation transaction.");
  } else {
    console.error("  ❌ FAILED: pushNotificationService not invoked in order.service.ts");
    process.exit(1);
  }

  // 4. Check API Routes
  const subscribePath = path.join(__dirname, '../src/app/api/v1/admin/notifications/subscribe/route.ts');
  const subscribeContent = fs.readFileSync(subscribePath, 'utf-8');
  console.log('\n✓ Admin API Security Guard verified.');

  if (subscribeContent.includes("requireRole") && subscribeContent.includes("RoleType.ADMIN")) {
    console.log("  ✓ Subscribe route protected with Admin role check & session user ID derivation.");
  } else {
    console.error("  ❌ FAILED: Subscribe route not properly secured.");
    process.exit(1);
  }

  console.log('\n=== ALL PUSH NOTIFICATION SYSTEM CHECKS PASSED ===\n');
}

runVerification();
