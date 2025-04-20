import React, { useState } from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const [colapsado, setColapsado] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          colapsado ? "w-16" : "w-64"
        } bg-[#1E2431] text-white flex flex-col transition-all duration-300`}
      >
        <div className="flex items-center justify-center h-16 px-4">
          <img
            src="/logo-nextlives.png"
            alt="Logo NextLives"
            className="h-12 object-contain"
          />
        </div>

        <nav className="flex-1 px-2 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 py-2 px-2 rounded hover:bg-[#2d3444]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3C7.03 3 3 7.03 3 12h3a6 6 0 0112 0h3c0-4.97-4.03-9-9-9zm0 18c4.97 0 9-4.03 9-9h-3a6 6 0 01-12 0H3c0 4.97 4.03 9 9 9zm0-4a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
            {!colapsado && <span>Inicio</span>}
          </Link>
        </nav>

        <div className="p-2 mt-auto">
          <button
            onClick={() => setColapsado(!colapsado)}
            className="w-full bg-[#2d3444] text-white py-1 text-xs rounded hover:bg-[#3b445c]"
          >
            {colapsado ? "→" : "←"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#1E2431] text-white flex items-center justify-end px-6 py-4 shadow">
          <Link
            to="#"
            className="bg-[#FF5C42] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#e04c35]"
          >
            Gestión del soporte
          </Link>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
