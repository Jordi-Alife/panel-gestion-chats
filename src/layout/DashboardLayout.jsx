import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Nuevos iconos actualizados
import IconInicio from "../assets/chat.svg";
import IconUsuarios from "../assets/usuarios.svg";
import IconToggle from "../assets/menu.svg";

const DashboardLayout = ({ children }) => {
  const [colapsado, setColapsado] = useState(false);
  const location = useLocation();

  const esPaginaUsuarios = location.pathname === "/usuarios";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
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

      {/* Layout principal */}
      <div className="flex flex-1 pt-[72px] h-full">
        {/* Sidebar */}
        <aside
          className={`relative ${
            colapsado ? "w-20" : "w-56"
          } bg-[#1E2431] flex flex-col justify-start transition-all duration-200`}
        >
          {/* Botón flotante lateral para colapsar/expandir */}
          <button
            onClick={() => setColapsado(!colapsado)}
            className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-[#2d3444] p-4 rounded-l-full shadow-md flex items-center justify-center hover:opacity-90 transition-all z-10"
            aria-label="Toggle menú"
          >
            <img
              src={IconToggle}
              alt="Toggle menú"
              className={`w-6 h-6 ${colapsado ? "rotate-180" : ""} transition-transform`}
            />
          </button>

          <div className="mt-4 space-y-1 text-sm">
            <Link
              to="/"
              className={`flex items-center py-2 pl-6 pr-3 text-white hover:bg-[#2d3444] rounded transition ${
                colapsado ? "justify-center" : "gap-3"
              }`}
            >
              <img src={IconInicio} alt="Inicio" className="w-5 h-5" />
              {!colapsado && <span>Inicio</span>}
            </Link>

            <Link
              to="/usuarios"
              className={`flex items-center py-2 pl-6 pr-3 text-white hover:bg-[#2d3444] rounded transition ${
                colapsado ? "justify-center" : "gap-3"
              }`}
            >
              <img src={IconUsuarios} alt="Usuarios" className="w-5 h-5" />
              {!colapsado && <span>Usuarios</span>}
            </Link>
          </div>
        </aside>

        {/* Contenido */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-100 rounded-tl-3xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
