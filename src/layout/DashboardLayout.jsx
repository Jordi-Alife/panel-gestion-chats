// src/layout/DashboardLayout.jsx
import React from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-[#1E2431] text-white flex items-center justify-between px-6 py-4 shadow z-10">
        <div className="flex items-center">
          <img
            src="/logo-nextlives.png"
            alt="NextLives"
            className="w-8 h-8 object-contain mr-3"
          />
        </div>
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

      {/* Layout con sidebar y contenido */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 bg-[#1E2431] flex flex-col items-center py-6">
          <img
            src="/logo-nextlives.png"
            alt="NextLives"
            className="w-10 h-10 object-contain"
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
