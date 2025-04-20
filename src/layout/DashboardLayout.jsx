// src/layout/DashboardLayout.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const [colapsado, setColapsado] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          colapsado ? "w-16" : "w-48"
        } bg-[#1E2431] flex flex-col transition-all duration-200 pt-20`}
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
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#1E2431] text-white flex items-center justify-between px-6 py-4 shadow">
          <img
            src="/logo-nextlives.png"
            alt="NextLives"
            className="h-7 object-contain"
          />
          <h1 className="text-lg font-medium text-center flex-1">
            Panel de soporte
          </h1>
          <Link
            to="#"
            className="bg-[#FF5C42] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#e04c35]"
          >
            Crear Canal Digital
          </Link>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
