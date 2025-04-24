// src/components/Notificaciones.jsx
import { useEffect } from 'react';
import { messaging, obtenerToken, onMessage } from '../firebase';

const Notificaciones = () => {
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          obtenerToken()
            .then((currentToken) => {
              if (currentToken) {
                console.log('Token FCM:', currentToken);
                // Aquí puedes enviarlo a tu backend si lo necesitas
              } else {
                console.warn('No se obtuvo el token.');
              }
            })
            .catch(err => {
              console.error('Error al obtener el token:', err);
            });
        }
      });
    }

    // Escuchar mensajes cuando la app está en primer plano
    onMessage(messaging, (payload) => {
      console.log('Notificación recibida en primer plano:', payload);
      alert(payload.notification?.title + '\n' + payload.notification?.body);
    });
  }, []);

  return null;
};

export default Notificaciones;
