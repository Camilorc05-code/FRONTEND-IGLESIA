import { api } from '../api/client';

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

export async function registrarPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[push] Service Worker o PushManager no soportados');
    return { ok: false, reason: 'no_support' };
  }

  try {
    const permiso = await Notification.requestPermission();
    if (permiso !== 'granted') {
      console.warn('[push] Permiso de notificaciones denegado');
      return { ok: false, reason: 'denied' };
    }

    const registration = await navigator.serviceWorker.ready;
    console.log('[push] Service Worker listo');

    let subscription = await registration.pushManager.getSubscription();
    console.log('[push] Suscripción existente:', !!subscription);

    if (!subscription) {
      const { data } = await api.get('/push/vapid-key');
      const vapidKey = urlBase64ToUint8Array(data.publicKey);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });
      console.log('[push] Nueva suscripción creada');
    }

    const sub = subscription.toJSON();
    console.log('[push] Guardando suscripción en servidor...');
    await api.post('/push/subscribe', {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    });

    console.log('[push] ✅ Suscripción registrada correctamente');
    return { ok: true };
  } catch (err) {
    console.error('[push] ❌ Error registrando push:', err.message);
    return { ok: false, reason: err.message };
  }
}

export async function verificarPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

  try {
    const permission = Notification.permission;
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

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
