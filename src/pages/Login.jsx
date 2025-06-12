// src/pages/Login.jsx
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseAuth"; // usamos misma app

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError("Email o contraseña incorrectos");
    }
  };

  const handleRecuperarPassword = async () => {
  setError("");
  setMensaje("");

  if (!email) {
    setError("Por favor, introduce tu email primero");
    return;
  }

  const auth = getAuth();
  try {
    await sendPasswordResetEmail(auth, email);
    setMensaje("Te hemos enviado un correo para restablecer la contraseña.");
  } catch (err) {
    console.error("❌ Error al enviar recuperación:", err);

    if (err.code === "auth/user-not-found") {
      setError("No hay ninguna cuenta registrada con ese email.");
    } else if (err.code === "auth/invalid-email") {
      setError("El email introducido no es válido.");
    } else if (err.code === "auth/missing-email") {
      setError("Por favor, introduce tu email.");
    } else {
      setError("No se pudo enviar el email de recuperación. Inténtalo más tarde.");
    }
  }
};
  return (
    <div className="min-h-screen bg-[#1E2431] flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo arriba */}
        <img
          src="/logo-nextlives.png"
          alt="NextLives"
          className="h-12 object-contain"
        />

        {/* Caja de login */}
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md space-y-6">
          <h2 className="text-xl font-bold text-center text-gray-800">Acceso Empresas</h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded text-center text-sm">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="bg-green-100 text-green-600 p-2 rounded text-center text-sm">
              {mensaje}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition text-sm"
            >
              Accede a NextLives
            </button>
          </form>

          {/* Enlace para recuperar contraseña */}
          <button
            type="button"
            onClick={handleRecuperarPassword}
            className="text-blue-600 text-xs hover:underline mt-2"
          >
            ¿Has olvidado tu contraseña?
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Si tienes problemas para acceder, contacta con nuestro equipo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
