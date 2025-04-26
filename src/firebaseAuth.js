// src/firebaseAuth.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // <- añadimos firestore para guardar agentes

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
const db = getFirestore(app);

// Función para invitar y guardar agente
export const invitarAgente = async (email, datosExtra = {}) => {
  try {
    const tempPass = crypto.randomUUID().slice(0, 10);
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPass);

    // Opcional: guardar más datos del agente en la colección "agentes"
    await setDoc(doc(db, "agentes", userCredential.user.uid), {
      email,
      activo: true,
      rol: "Administrador",
      ...datosExtra,
      ultimaConexion: new Date().toISOString()
    });

    await sendPasswordResetEmail(auth, email);
    console.log(`✅ Invitación enviada a ${email} y agente registrado.`);
  } catch (error) {
    console.error("❌ Error al invitar agente:", error.code, error.message);
  }
};

export { app };
