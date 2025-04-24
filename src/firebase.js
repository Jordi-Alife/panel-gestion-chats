// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyB0vz-jtc7PRpdFfQUKvU9PevLEV8zYzO4",
  authDomain: "nextlives-panel-soporte.firebaseapp.com",
  projectId: "nextlives-panel-soporte",
  storageBucket: "nextlives-panel-soporte.firebasestorage.app",
  messagingSenderId: "52725281576",
  appId: "1:52725281576:web:4402c0507962074345161d"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa el servicio de mensajes
const messaging = getMessaging(app);

// VAPID key pública (desde Firebase Console > Cloud Messaging > Certificados push web)
const VAPID_KEY = "BGBob8bXua7_QSiRd_QHLp6ZvwSRN2gq00Fm8VGk4CbquXL28qa8y-pPevdP7tC_e-EdLpxQCJ_Vjn2fTOpru6A";

// Función para obtener el token de notificación
const obtenerToken = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      console.log('🔑 Token de notificación:', currentToken);
      return currentToken;
    } else {
      console.warn('⚠️ No se pudo obtener el token. ¿Permiso denegado?');
      return null;
    }
  } catch (err) {
    console.error('❌ Error al obtener el token de notificación:', err);
    return null;
  }
};

export { messaging, obtenerToken, onMessage };
