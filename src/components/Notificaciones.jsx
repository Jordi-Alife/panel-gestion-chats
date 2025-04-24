// src/components/Notificaciones.jsx
import { useEffect } from 'react';
import { obtenerToken, escucharMensajes } from '../firebase';

const Notificaciones = () => {
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(async (permission) => {
        if (permission === 'granted') {
          const token = await obtenerToken();
          if (token) {
            console.log("🔔 Token FCM:", token);
          } else {
            console.warn("⚠️ No se obtuvo token FCM.");
          }
        }
      });
    }

    // Escuchar notificaciones en primer plano
    escucharMensajes((payload) => {
      console.log("📩 Notificación recibida:", payload);
      if (payload?.notification?.title) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/icon-192x192.png'
        });
      }
    });
  }, []);

  return null;
};

export default Notificaciones;
