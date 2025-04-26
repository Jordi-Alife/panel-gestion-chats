// src/pages/Login.jsx
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebaseAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      setMensaje("✅ Acceso correcto. Redirigiendo...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error(error.code, error.message);
      setMensaje("❌ Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E2431] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <img src="/logo-nextlives.png" alt="NextLives" className="h-10 mx-auto mb-6" />
        <h1 className="text-xl font-bold mb-6">Acceso Empresas</h1>

        {mensaje && (
          <div className="mb-4 text-sm font-medium text-red-500">{mensaje}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-semibold mb-1">E-mail</label>
            <input
              type="email"
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5733]"
              placeholder="Escribe tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5733]"
              placeholder="Escribe tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-xs text-right mt-1">
              <a href="#" className="text-[#ff5733] hover:underline">
                ¿Has olvidado tu contraseña?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ff5733] hover:bg-orange-600 text-white font-semibold py-2 rounded-md text-sm transition-all"
          >
            Accede a NextLives
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-400">
          Si tienes problemas para acceder, contacta con nuestro equipo.<br />
          <a href="https://wa.me/34690083580" target="_blank" className="text-[#ff5733] hover:underline">
            WhatsApp Business (+34 690 083 580)
          </a>
        </div>

        <div className="mt-8 text-[10px] text-gray-400">
          © NextLives 2025 · 
          <a href="#" className="hover:underline ml-1">Términos</a> · 
          <a href="#" className="hover:underline ml-1">Política de privacidad</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
