// src/layout/DashboardLayout.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BotonToggle from "../assets/button-small.jpeg"; // ✅ Import desde src/assets

const DashboardLayout = ({ children }) => {
  const [colapsado, setColapsado] = useState(false);
  const location = useLocation();

  const esPaginaUsuarios = location.pathname === "/usuarios";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header fijo arriba */}
      <header className="bg-[#1E2431] text-white flex items-center justify-between px-6 py-4 shadow fixed top-0 left-0 right-0 z-20">
        <img
          src="/logo-nextlives.png"
          alt="NextLives"
          className="h-10 object-contain"
        />
        <div className="flex-1" />
        {esPaginaUsuarios && (
          <Link
            to="#"
            className="bg-[#FF5C42] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#e04c35]"
          >
            Crear usuario
          </Link>
        )}
      </header>

      {/* Contenedor principal debajo del header */}
      <div className="flex flex-1 pt-[72px] h-full">
        {/* Sidebar debajo del header */}
        <aside
          className={`${
            colapsado ? "w-16" : "w-48"
          } bg-[#1E2431] flex flex-col transition-all duration-200`}
        >
          <button
            onClick={() => setColapsado(!colapsado)}
            className="p-2 hover:bg-[#2d3444] transition focus:outline-none"
            aria-label="Contraer/Expandir menú"
          >
            <img
              src={BotonToggle}
              alt="Toggle menú"
              className={`w-5 h-5 ${colapsado ? "rotate-180" : ""} transition-transform`}
            />
          </button>

          <nav className={`mt-4 text-white text-sm ${colapsado ? "px-0" : "px-2"}`}>
            <Link
              to="/"
              className={`flex items-center py-2 px-2 rounded hover:bg-[#2d3444] ${
                colapsado ? "justify-center" : "gap-2"
              }`}
            >
              <span>🏠</span>
              {!colapsado && <span>Inicio</span>}
            </Link>
            <Link
              to="/usuarios"
              className={`flex items-center py-2 px-2 rounded hover:bg-[#2d3444] ${
                colapsado ? "justify-center" : "gap-2"
              }`}
            >
              <span>👤</span>
              {!colapsado && <span>Usuarios</span>}
            </Link>
          </nav>
        </aside>

        {/* Contenido */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
