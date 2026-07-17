// Service Worker — Misión Panamericana
// Push notifications + Cache offline (PWA)

const CACHE_NAME = 'mision-panamericana-v1';
const APP_SHELL = [
  '/',
  '/horarios',
  '/eventos',
  '/citas',
  '/donaciones',
  '/registrarse',
  '/redes',
  '/logo-192.png',
  '/logo-512.png',
  '/manifest.json',
];

// Instalar: cachear app shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

// Activar: limpiar caches viejos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).catch(() => {})
  );
  self.clients.claim();
});

// Fetch: network-first para API, cache-first para assets
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // No cachear peticiones a la API ni auth
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/admin/login')) {
    return;
  }

  // No cachear si es POST/PUT/DELETE
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Guardar en cache si es válida
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, servir del cache
        return caches.match(e.request).then((cached) => {
          if (cached) return cached;
          // Si es navegación, servir la página principal
          if (e.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Sin conexión', { status: 503 });
        });
      })
  );
});

// Push notifications
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
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/admin' },
    actions: [
      { action: 'abrir', title: 'Ver', icon: '/logo-192.png' },
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
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
