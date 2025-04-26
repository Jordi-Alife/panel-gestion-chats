// src/firebaseAuth.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB0vz-jtc7PRpdFfQUKvU9PevLEV8zYzO4",
  authDomain: "nextlives-panel-soporte.firebaseapp.com",
  projectId: "nextlives-panel-soporte",
  storageBucket: "nextlives-panel-soporte.appspot.com",
  messagingSenderId: "52725281576",
  appId: "1:52725281576:web:4402c0507962074345161d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Esta función no crea contraseña: solo registra y envía email de recuperación
export const invitarUsuario = async (email) => {
  try {
    const tempPass = crypto.randomUUID().slice(0, 10);
    await createUserWithEmailAndPassword(auth, email, tempPass);
    await sendPasswordResetEmail(auth, email);
    console.log(`✅ Invitación enviada a ${email}`);
  } catch (error) {
    console.error("❌ Error al invitar usuario:", error.code, error.message);
  }
};

export { app }; // << AÑADE ESTA LÍNEA
