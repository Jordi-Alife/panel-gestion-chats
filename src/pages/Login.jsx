// src/pages/Login.jsx
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB0vz-jtc7PRpdFfQUKvU9PevLEV8zYzO4",
  authDomain: "nextlives-panel-soporte.firebaseapp.com",
  projectId: "nextlives-panel-soporte",
  storageBucket: "nextlives-panel-soporte.appspot.com",
  messagingSenderId: "52725281576",
  appId: "1:52725281576:web:4402c0507962074345161d",
};

initializeApp(firebaseConfig);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/";
    } catch (err) {
      setError("Email o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen bg-[#1E2431] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl relative text-center">
        <img
          src="/logo-nextlives.png"
          alt="NextLives"
          className="w-32 mx-auto mb-4"
        />
        <h1 className="text-xl font-bold mb-6">Acceso NextLives</h1>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              Mantenerme conectado una semana
            </label>
            <a href="#" className="text-blue-600 hover:underline">
              ¿Has olvidado tu contraseña?
            </a>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-[#4F46E5] hover:bg-[#3f3cc7] text-white rounded font-semibold mt-2"
          >
            Accede a NextLives
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6">
          Si tienes problemas para acceder, contacta con nuestro equipo.{" 
