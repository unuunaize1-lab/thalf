// THALF Admin PWA Service Worker for Web Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Handle incoming Web Push Notifications
self.addEventListener('push', (event) => {
  let data = {
    title: '🍫 New THALF Order',
    body: 'A new customer order was received.',
    data: { url: '/admin/orders' },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        data: payload.data || { url: payload.orderId ? `/admin/orders/${payload.orderId}` : '/admin/orders' },
      };
    } catch (err) {
      data.body = event.data.text() || data.body;
    }
  }

  const notificationUrl = data.data?.url || (data.data?.orderId ? `/admin/orders/${data.data.orderId}` : '/admin/orders');

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: notificationUrl, ...data.data },
    tag: `order-notification-${data.data?.orderId || Date.now()}`,
    renotify: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'View Order' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 2. Handle Notification Clicks to open/focus Admin Order detail page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/admin/orders';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If an existing admin tab is open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
