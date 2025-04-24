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

// VAPID key pública desde Firebase Console
const VAPID_KEY = "BGBob8bXua7_QSiRd_QHLp6ZvwSRN2gq00Fm8VGk4CbquXL28qa8y-pPevdP7tC_e-EdLpxQCJ_Vjn2fTOpru6A";

// 👉 Solo se obtiene messaging dentro de la función, no al cargar el módulo
async function obtenerToken() {
  try {
    const soportado = await isSupported();
    if (!soportado) {
      console.warn("🚫 Firebase Messaging no es compatible en este navegador.");
      return null;
    }

    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

    if (token) {
      console.log("🔐 Token obtenido:", token);
      return token;
    } else {
      console.warn("⚠️ No se pudo obtener el token.");
      return null;
    }
  } catch (err) {
    console.error("❌ Error al obtener token:", err);
    return null;
  }
}

// 👉 onMessage también se usa dinámicamente
function escucharMensajes(callback) {
  isSupported().then((soportado) => {
    if (!soportado) return;
    const messaging = getMessaging(app);
    onMessage(messaging, callback);
  });
}

export { obtenerToken, escucharMensajes };
