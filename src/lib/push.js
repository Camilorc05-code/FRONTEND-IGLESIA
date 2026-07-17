import { api } from '../api/client';

// Convertir VAPID public key de base64url a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Registrar Service Worker y suscribir a push
export async function registrarPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  try {
    // Pedir permiso
    const permiso = await Notification.requestPermission();
    if (permiso !== 'granted') return;

    // Registrar service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Obtener suscripción existente
    let subscription = await registration.pushManager.getSubscription();

    // Si no tiene suscripción, crear una
    if (!subscription) {
      const { data } = await api.get('/push/vapid-key');
      const vapidKey = urlBase64ToUint8Array(data.publicKey);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });
    }

    // Enviar suscripción al backend
    const sub = subscription.toJSON();
    await api.post('/push/subscribe', {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    });
  } catch (err) {
    console.error('[push] Error registrando push:', err.message);
  }
}

// Desuscribir push (al cerrar sesión)
export async function desuscribirPush() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const sub = subscription.toJSON();
    await api.delete('/push/unsubscribe', { data: { endpoint: sub.endpoint } });
    await subscription.unsubscribe();
  } catch (err) {
    console.error('[push] Error desuscribiendo:', err.message);
  }
}
