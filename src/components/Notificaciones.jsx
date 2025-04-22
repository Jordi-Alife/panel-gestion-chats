// src/components/Notificaciones.jsx
import { useEffect } from 'react';
import { messaging, getToken, onMessage } from '../firebase';

const claveVAPID = 'B6CobD8xIua7_QSiidRQLHc6ZwSRN29g00Fm8VGk4CBquXL28qag8yPcP8vdP7lC_eEdLpxQGJ_CVjn2fTP0ur6A';

const Notificaciones = () => {
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          getToken(messaging, { vapidKey: claveVAPID })
            .then((currentToken) => {
              if (currentToken) {
                console.log('Token FCM:', currentToken);
                // Aquí puedes enviarlo a tu backend
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
