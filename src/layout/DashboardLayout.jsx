// src/layout/DashboardLayout.jsx
import React from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-16 bg-[#1E2431] flex flex-col items-center py-4">
        <img src="/logo-nextlives.png" alt="NextLives" className="w-8 h-8 mb-6 object-contain" />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#1E2431] text-white flex items-center justify-between px-6 py-4 shadow">
          <div className="flex items-center gap-3">
            <img src="/logo-nextlives.png" alt="NextLives" className="w-6 h-6 object-contain" />
          </div>
          <h1 className="text-lg font-medium text-center flex-1 -ml-10">
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
