import React from "react";
import { Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
        <div className="h-16 flex items-center justify-center font-bold text-xl border-b">
          NextLives
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-200">
                Panel general
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center px-6 shadow-sm">
          <h1 className="text-xl font-semibold">Panel de soporte</h1>
        </header>

        {/* Content */}
        <main className="p-6 overflow-auto flex-1">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
