import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import IconInicio from "../assets/dashboard-1.svg";
import IconAgentes from "../assets/agentes.svg";
import IconToggle from "../assets/menu.svg";
import IconConversaciones from "../assets/chat.svg";
import IconUserFamily from "../assets/user-family.svg";
import IconSkyscraper from "../assets/skyscraper.svg";
import IconMonitor from "../assets/icon-monitor-estado.svg";
import LogoCompleto from "../assets/logo-nextlives-new(1).svg";
import LogoPequeno from "../assets/logo-nextlives-new.svg";
import ModoOscuroToggle from "../components/ModoOscuroToggle"; // ✅ Línea añadida

const DashboardLayout = ({ children }) => {
  const [colapsado, setColapsado] = useState(true);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [nombrePerfil, setNombrePerfil] = useState("");
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const [notificaciones, setNotificaciones] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const rolUsuario = localStorage.getItem("rol-usuario-panel") || "Soporte";
  const esPaginaAgentes = location.pathname === "/agentes";

  useEffect(() => {
    const cargarPerfil = () => {
      const guardado = JSON.parse(localStorage.getItem("perfil-usuario-panel"));
      if (guardado) {
        setCargandoFoto(true);
        const img = new Image();
        img.src = guardado.foto || "https://i.pravatar.cc/100";
        img.onload = () => {
          setFotoPerfil(guardado.foto || "");
          setNombrePerfil(guardado.nombre || "");
          setCargandoFoto(false);
        };
      } else {
        setFotoPerfil("");
        setNombrePerfil("");
      }
    };

    cargarPerfil();
    const listener = () => cargarPerfil();
    window.addEventListener("actualizar-foto-perfil", listener);

    const notif = (e) => setNotificaciones(e.detail.total || 0);
    window.addEventListener("notificaciones-nuevas", notif);

    return () => {
      window.removeEventListener("actualizar-foto-perfil", listener);
      window.removeEventListener("notificaciones-nuevas", notif);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      import ModoOscuroToggle from "../components/ModoOscuroToggle"; // Asegúrate de que esté al inicio del archivo

// ...

<header className="bg-[#1E2431] text-white flex items-center justify-between px-6 py-4 shadow fixed top-0 left-0 right-0 z-20">
  <div className="flex items-center gap-3">
    <button
      className="md:hidden"
      onClick={() => setMenuMovilAbierto(true)}
      aria-label="Abrir menú"
    >
      <img src={IconToggle} alt="Abrir menú" className="w-8 h-8" />
    </button>
    <img
      src={colapsado ? LogoPequeno : LogoCompleto}
      alt="NextLives"
      className={`object-contain ${colapsado ? "h-10" : "h-12"}`}
    />
  </div>

  <div className="flex items-center gap-3">
    <ModoOscuroToggle /> {/* ✅ Botón de modo oscuro */}
    {esPaginaAgentes && rolUsuario === "Administrador" && (
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("crear-agente"))}
        className="bg-[#FF5C42] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#e04c35]"
      >
        Crear agente
      </button>
    )}
  </div>
</header>

      {/* Menú móvil */}
      {menuMovilAbierto && (
        <div className="fixed inset-0 bg-[#1E2431] text-white flex flex-col p-6 z-30 md:hidden">
          <button
            className="self-end mb-6"
            onClick={() => setMenuMovilAbierto(false)}
            aria-label="Cerrar menú"
          >
            <img src={IconToggle} alt="Cerrar menú" className="w-8 h-8 rotate-180" />
          </button>

          <nav className="space-y-4">
            <Link to="/" onClick={() => setMenuMovilAbierto(false)} className="block py-2">
              Inicio
            </Link>
            <button
              onClick={() => {
                const destino = window.innerWidth < 768 ? "/conversaciones-movil" : "/conversaciones";
                navigate(destino);
                setMenuMovilAbierto(false);
              }}
              className="block py-2 w-full text-left"
            >
              Conversaciones
            </button>
            <Link to="/monitor" onClick={() => setMenuMovilAbierto(false)} className="block py-2">
              Monitor
            </Link>
            {rolUsuario !== "Soporte" && (
              <Link to="/agentes" onClick={() => setMenuMovilAbierto(false)} className="block py-2">
                Agentes
              </Link>
            )}
            <button onClick={() => navigate("/perfil")} className="block py-2">
              Mi perfil
            </button>
          </nav>
        </div>
      )}

      {/* Layout principal */}
      <div className="flex flex-1 h-[calc(100dvh-72px)]">
  <aside
    className={`relative hidden md:flex flex-col justify-between pt-[72px] ${
      colapsado ? "w-20" : "w-64"
    } bg-[#1E2431] transition-all duration-200`}
  >
          <div>
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

            <div className="mt-4 space-y-1 text-sm relative z-20">
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
                to="/conversaciones"
                className={`flex items-center py-2 pl-6 pr-3 text-white hover:bg-[#2d3444] rounded transition relative ${
                  colapsado ? "justify-center" : "gap-3"
                }`}
              >
                <img src={IconConversaciones} alt="Conversaciones" className="w-5 h-5" />
                {!colapsado && <span>Conversaciones</span>}
                {notificaciones > 0 && (
                  <span className="absolute -top-1.5 right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {notificaciones}
                  </span>
                )}
              </Link>

              <Link
                to="/monitor"
                className={`flex items-center py-2 pl-6 pr-3 text-white hover:bg-[#2d3444] rounded transition ${
                  colapsado ? "justify-center" : "gap-3"
                }`}
              >
                <img src={IconMonitor} alt="Monitor" className="w-5 h-5" />
                {!colapsado && <span>Monitor</span>}
              </Link>

              {rolUsuario !== "Soporte" && (
                <Link
                  to="/agentes"
                  className={`flex items-center py-2 pl-6 pr-3 text-white hover:bg-[#2d3444] rounded transition ${
                    colapsado ? "justify-center" : "gap-3"
                  }`}
                >
                  <img src={IconAgentes} alt="Agentes" className="w-5 h-5" />
                  {!colapsado && <span>Agentes</span>}
                </Link>
              )}
            </div>
          </div>

          <div className="px-4 pb-6 z-20 space-y-2">
            {colapsado ? (
              <>
                <button className="w-full bg-[#FC6655] rounded-xl flex items-center justify-center h-12">
                  <img src={IconUserFamily} alt="Soporte Familias" className="w-6 h-6" />
                </button>
                <button className="w-full bg-[#4560FE] rounded-xl flex items-center justify-center h-12 opacity-60 cursor-not-allowed">
                  <img src={IconSkyscraper} alt="Soporte Empresas" className="w-6 h-6" />
                </button>
                <div className="flex justify-center mt-2">
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
              </>
            ) : (
              <>
                <button
                  className="w-full bg-[#FC6655] text-white font-semibold py-2 rounded-xl text-sm hover:opacity-90 transition flex items-center gap-2 justify-center"
                >
                  <img src={IconUserFamily} alt="Icono Familias" className="w-4 h-4" />
                  Soporte Familias
                </button>
                <button
                  className="w-full bg-[#4560FE] text-white font-semibold py-2 rounded-xl text-sm opacity-60 cursor-not-allowed flex items-center gap-2 justify-center"
                >
                  <img src={IconSkyscraper} alt="Icono Empresas" className="w-4 h-4" />
                  Soporte Empresas
                </button>

                <div
                  onClick={() => navigate("/perfil")}
                  className="bg-[#3a3f4b] text-white rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#4c5260] mt-2"
                >
                  <img
                    src={fotoPerfil || "https://i.pravatar.cc/100"}
                    alt="Perfil"
                    className={`w-10 h-10 rounded-full object-cover transition-opacity duration-500 ${
                      cargandoFoto ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-sm leading-tight">
                      {nombrePerfil || "Mi perfil"}
                    </div>
                    <div className="text-xs text-gray-400">Editar</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col justify-between p-6 overflow-y-auto bg-gray-100">
          {children}
          <footer className="hidden md:flex mt-12 border-t pt-4 text-xs text-gray-500 flex-col sm:flex-row justify-between items-center gap-2">
            <span>© NextLives 2025</span>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">
                Condiciones generales
              </a>
              <a href="#" className="hover:underline">
                Política de privacidad
              </a>
              <a href="#" className="hover:underline">
                Política de cookies
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
