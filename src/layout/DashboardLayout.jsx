// src/layout/DashboardLayout.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out w-64 bg-white shadow-md flex-col fixed md:static z-50`}
      >
        <div className="h-16 bg-[#0f2d45] flex items-center justify-center">
          <img src="/logo-nextlives.png" alt="NextLives" className="h-10" />
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="block py-2 px-4 rounded hover:bg-gray-200"
              >
                Panel general
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-[#0f2d45] text-white border-b flex items-center px-6 shadow-sm">
          <button
            className="md:hidden mr-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Panel de soporte</h1>
        </header>

        {/* Content */}
        <main className="p-6 overflow-auto flex-1">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
