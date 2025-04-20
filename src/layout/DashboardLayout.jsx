import React, { useState } from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const [colapsado, setColapsado] = useState(false);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header fijo arriba */}
      <header className="bg-[#1E2431] text-white flex items-center justify-between px-6 py-4 shadow fixed top-0 left-0 right-0 z-20">
        <img
          src="/logo-nextlives.png"
          alt="NextLives"
          className="h-10 object-contain"
        />
        <div className="flex-1" /> {/* Elimina el título centrado */}
        <Link
          to="#"
          className="bg-[#FF5C42] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#e04c35]"
        >
          Gestión del soporte
        </Link>
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
            className="text-white text-sm p-2 hover:bg-[#2d3444] focus:outline-none"
          >
            {colapsado ? "➤" : "◀︎"}
          </button>

          <nav className="mt-4 px-2 text-white text-sm">
            <Link
              to="/"
              className="flex items-center gap-2 py-2 px-2 rounded hover:bg-[#2d3444]"
            >
              <span>🏠</span>
              {!colapsado && <span>Inicio</span>}
            </Link>

            <Link
              to="/usuarios"
              className="flex items-center gap-2 py-2 px-2 rounded hover:bg-[#2d3444]"
            >
              <span>👥</span>
              {!colapsado && <span>Usuarios</span>}
            </Link>
          </nav>
        </aside>

        {/* Contenido */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
