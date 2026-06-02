self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'Social Score', body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Social Score', {
      body: data.body || '',
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
