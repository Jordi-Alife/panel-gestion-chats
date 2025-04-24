// src/components/Notificaciones.jsx
import { useEffect } from 'react';
import { obtenerToken, escucharMensajes } from '../firebase';

const Notificaciones = () => {
  useEffect(() => {
    // Pedir permiso de notificación
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(async (permission) => {
        if (permission === 'granted') {
          const token = await obtenerToken();
          if (token) {
            console.log('Token FCM:', token);
            // Aquí podrías enviarlo a tu backend si lo necesitas
          } else {
            console.warn('No se obtuvo el token.');
          }
        }
      });
    }

    // Escuchar notificaciones en primer plano
    escucharMensajes((payload) => {
      console.log('Notificación recibida en primer plano:', payload);
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
