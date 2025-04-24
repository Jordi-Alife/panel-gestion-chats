// src/firebase.js
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyB0vz-jtc7PRpdFfQUKvU9PevLEV8zYzO4",
  authDomain: "nextlives-panel-soporte.firebaseapp.com",
  projectId: "nextlives-panel-soporte",
  storageBucket: "nextlives-panel-soporte.firebasestorage.app",
  messagingSenderId: "52725281576",
  appId: "1:52725281576:web:4402c0507962074345161d"
};

const app = initializeApp(firebaseConfig);

// Clave VAPID pública
const VAPID_KEY = "BGBob8bXua7_QSiRd_QHLp6ZvwSRN2gq00Fm8VGk4CbquXL28qa8y-pPevdP7tC_e-EdLpxQCJ_Vjn2fTOpru6A";

// Función segura para obtener el token
export async function obtenerToken() {
  if (typeof window === "undefined") return null;

  const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
  const soportado = await isSupported();
  if (!soportado) return null;

  const messaging = getMessaging(app);
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log("🔐 Token:", token);
    return token;
  } catch (err) {
    console.error("❌ Error al obtener token:", err);
    return null;
  }
}

// Escuchar mensajes en primer plano
export async function escucharMensajes(callback) {
  if (typeof window === "undefined") return;

  const { getMessaging, onMessage, isSupported } = await import('firebase/messaging');
  const soportado = await isSupported();
  if (!soportado) return;

  const messaging = getMessaging(app);
  onMessage(messaging, callback);
}

// Export opcional para otras partes del proyecto
export { app };
