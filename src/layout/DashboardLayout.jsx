import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "/logo-nextlives.png";

const DashboardLayout = ({ children }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className={`bg-white shadow-md fixed md:static z-40 transition-transform duration-300 ease-in-out h-full w-64 transform ${menuAbierto ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="h-16 flex items-center justify-center border-b">
          <img src={logo} alt="NextLives" className="h-10" />
        </div>
        <nav className="p-4">
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
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header */}
        <header className="h-16 bg-[#0f2c3f] text-white flex items-center px-4 md:px-6 shadow-sm justify-between md:justify-start">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden focus:outline-none"
          >
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold ml-2 md:ml-0">Panel de soporte</h1>
        </header>

        {/* Content */}
        <main className="p-6 overflow-auto flex-1">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
