// Service Worker para Push Notifications
// Misión Panamericana

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('push', (e) => {
  let data = { titulo: 'Misión Panamericana', mensaje: 'Tienes una notificación nueva.' };

  if (e.data) {
    try {
      data = e.data.json();
    } catch {
      data.mensaje = e.data.text();
    }
  }

  const options = {
    body: data.mensaje,
    icon: '/logo-mjp.png',
    badge: '/logo-mjp.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/admin' },
    actions: [
      { action: 'abrir', title: 'Ver', icon: '/logo-mjp.png' },
    ],
  };

  e.waitUntil(
    self.registration.showNotification(data.titulo, options)
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/admin';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
