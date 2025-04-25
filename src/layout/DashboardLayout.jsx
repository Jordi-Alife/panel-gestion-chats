import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import IconInicio from "../assets/chat.svg";
import IconAgentes from "../assets/agentes.svg";
import IconToggle from "../assets/menu.svg";

const DashboardLayout = ({ children }) => {
  const [colapsado, setColapsado] = useState(false);
  const location = useLocation();
  const esPaginaAgentes = location.pathname === "/usuarios";

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
        {esPaginaAgentes && (
          <Link
            to="#"
            className="bg-[#FF5C42] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#e04c35]"
          >
            Crear agente
          </Link>
        )}
      </header>

      {/* Layout principal */}
      <div className="flex flex-1 pt-[72px] h-full">
        {/* Sidebar */}
        <aside
          className={`relative ${
            colapsado ? "w-20" : "w-56"
          } bg-[#1E2431] flex flex-col justify-start transition-all duration-200 overflow-hidden`}
        >
          {/* Curva decorativa exterior (a la derecha) */}
          <div className="absolute top-0 -right-6 w-6 h-6 bg-[#1E2431] rounded-bl-3xl z-10" />

          {/* Botón de colapsar/expandir */}
          <button
            onClick={() => setColapsado(!colapsado)}
            className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-[#2d3444] p-4 rounded-r-full shadow-md flex items-center justify-center hover:opacity-90 transition-all z-20"
            aria-label="Toggle menú"
          >
            <img
              src={IconToggle}
              alt="Toggle menú"
              className={`w-8 h-8 ${colapsado ? "rotate-180" : ""} transition-transform`}
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
              <img src={IconAgentes} alt="Agentes" className="w-5 h-5" />
              {!colapsado && <span>Agentes</span>}
            </Link>
          </div>

          {/* Info del agente logueado */}
          <div className="mt-auto px-4 pb-6">
            {colapsado ? (
              <div className="flex justify-center">
                <img
                  src="https://i.pravatar.cc/100"
                  alt="Amber Walker"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="bg-[#3a3f4b] text-white rounded-2xl p-3 flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/100"
                  alt="Amber Walker"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-sm leading-tight">Amber Walker</div>
                  <div className="text-xs text-gray-400">awalker</div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Contenido */}
        <main className="flex-1 flex flex-col justify-between p-6 overflow-y-auto bg-gray-100">
          {children}

          {/* Footer legal */}
          <footer className="mt-12 border-t pt-4 text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© NextLives 2025</span>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Condiciones generales</a>
              <a href="#" className="hover:underline">Política de privacidad</a>
              <a href="#" className="hover:underline">Política de cookies</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
