// src/layout/DashboardLayout.jsx
import React, { useState } from "react";
import logo from "../assets/logo-nextlives.png"; // Asegúrate de que la ruta sea correcta

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <header className="bg-gray-900 text-white flex items-center justify-between px-4 py-3 shadow">
        <img
          src={logo}
          alt="NextLives"
          className="h-8 w-auto"
        />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white focus:outline-none text-2xl"
        >
          ☰
        </button>
      </header>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        {sidebarOpen && (
          <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
            <nav className="space-y-2">
              <div className="hover:text-blue-400 cursor-pointer">Inicio</div>
              <div className="hover:text-blue-400 cursor-pointer">Centro de trabajo</div>
              <div className="hover:text-blue-400 cursor-pointer">Gestión</div>
              <div className="hover:text-blue-400 cursor-pointer">Marketing</div>
              <div className="hover:text-blue-400 cursor-pointer">Financiero</div>
              <div className="hover:text-blue-400 cursor-pointer">Desarrolladores</div>
              <div className="hover:text-blue-400 cursor-pointer">Canal Digital</div>
            </nav>
          </aside>
        )}

        {/* MAIN */}
        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
