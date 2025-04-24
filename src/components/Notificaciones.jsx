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
      const { title, body, icon } = payload?.notification || {};
      if (title && 'Notification' in window) {
        try {
          new Notification(title, {
            body: body || '',
            icon: icon || '/icon-192x192.png'
          });
        } catch (err) {
          console.warn("No se pudo mostrar la notificación:", err);
        }
      }
    });
  }, []);

  return null;
};

export default Notificaciones;
