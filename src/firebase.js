// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

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

// Solo inicializamos messaging si el navegador lo soporta
let messaging = null;

isSupported().then((soportado) => {
  if (soportado) {
    messaging = getMessaging(app);
  } else {
    console.warn("🚫 Firebase messaging no es compatible en este navegador.");
  }
});

// VAPID key pública
const VAPID_KEY = "BGBob8bXua7_QSiRd_QHLp6ZvwSRN2gq00Fm8VGk4CbquXL28qa8y-pPevdP7tC_e-EdLpxQCJ_Vjn2fTOpru6A";

// Obtener token
const obtenerToken = async () => {
  try {
    const soportado = await isSupported();
    if (!soportado) return null;
    const currentToken = await getToken(getMessaging(app), { vapidKey: VAPID_KEY });
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

export { obtenerToken, onMessage };
