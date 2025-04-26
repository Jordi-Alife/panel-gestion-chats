// src/layout/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import IconInicio from "../assets/chat.svg";
import IconAgentes from "../assets/agentes.svg";
import IconToggle from "../assets/menu.svg";

const DashboardLayout = ({ children }) => {
  const [colapsado, setColapsado] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const esPaginaAgentes = location.pathname === "/usuarios";

  const [fotoPerfil, setFotoPerfil] = useState("");
  const [cargandoFoto, setCargandoFoto] = useState(false);

  useEffect(() => {
    const cargarFotoPerfil = () => {
      const guardado = JSON.parse(localStorage.getItem("perfil-usuario-panel"));
      if (guardado?.foto) {
        setCargandoFoto(true);
        const img = new Image();
        img.src = guardado.foto;
        img.onload = () => {
          setFotoPerfil(guardado.foto);
          setCargandoFoto(false);
        };
      } else {
        setFotoPerfil("");
      }
    };

    cargarFotoPerfil();
    window.addEventListener("actualizar-foto-perfil", cargarFotoPerfil);
    return () => window.removeEventListener("actualizar-foto-perfil", cargarFotoPerfil);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#1E2431] text-white flex items-center justify-between px-6 py-4 shadow fixed top-0 left-0 right-0 z-20">
        <img src="/logo-nextlives.png" alt="NextLives" className="h-10 object-contain" />
        <div className="flex-1" />
        {esPaginaAgentes && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("crear-agente"))}
            className="bg-[#FF5C42] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#e04c35]"
          >
            Crear agente
          </button>
        )}
      </header>

      {/* Layout principal */}
      <div className="flex flex-1 pt-[72px] h-full">
        {/* Sidebar */}
        <aside
          className={`relative ${
            colapsado ? "w-20" : "w-56"
          } bg-[#1E2431] flex flex-col justify-between transition-all duration-200 overflow-hidden`}
        >
          {/* Extensión decorativa */}
          <div className="absolute top-0 -right-3 w-6 h-6 bg-[#1E2431] rounded-bl-3xl z-10" />

          {/* Botón de colapsar */}
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

          {/* Iconos centrados */}
          <div className="flex flex-1 flex-col justify-center items-center space-y-4 mt-4 text-sm relative z-20">
            <Link
              to="/"
              className={`flex items-center text-white hover:bg-[#2d3444] rounded transition ${
                colapsado ? "justify-center w-12 h-12" : "px-6 py-2 w-full"
              }`}
            >
              <img src={IconInicio} alt="Inicio" className="w-5 h-5" />
              {!colapsado && <span className="ml-3">Inicio</span>}
            </Link>

            <Link
              to="/usuarios"
              className={`flex items-center text-white hover:bg-[#2d3444] rounded transition ${
                colapsado ? "justify-center w-12 h-12" : "px-6 py-2 w-full"
              }`}
            >
              <img src={IconAgentes} alt="Agentes" className="w-5 h-5" />
              {!colapsado && <span className="ml-3">Agentes</span>}
            </Link>
          </div>

          {/* Perfil */}
          <div className="px-4 pb-6 z-20">
            {colapsado ? (
              <div className="flex justify-center">
                <button onClick={() => navigate("/perfil")}>
                  <img
                    src={fotoPerfil || "https://i.pravatar.cc/100"}
                    alt="Perfil"
                    className={`w-10 h-10 rounded-full object-cover transition-opacity duration-500 ${
                      cargandoFoto ? "opacity-0" : "opacity-100"
                    }`}
                  />
                </button>
              </div>
            ) : (
              <div
                onClick={() => navigate("/perfil")}
                className="bg-[#3a3f4b] text-white rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#4c5260]"
              >
                <img
                  src={fotoPerfil || "https://i.pravatar.cc/100"}
                  alt="Perfil"
                  className={`w-10 h-10 rounded-full object-cover transition-opacity duration-500 ${
                    cargandoFoto ? "opacity-0" : "opacity-100"
                  }`}
                />
                <div>
                  <div className="font-semibold text-sm leading-tight">Mi perfil</div>
                  <div className="text-xs text-gray-400">Editar</div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 flex flex-col justify-between p-6 overflow-y-auto bg-gray-100">
          {children}

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
