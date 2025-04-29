// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import Detalle from "./pages/Detalle";
import Agentes from "./pages/agentes";
import Perfil from "./pages/Perfil";
import Login from "./pages/Login";
import Notificaciones from "./components/Notificaciones";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "./firebaseAuth";
import Conversaciones from "./pages/Conversaciones"; // ✅ NUEVO

const Panel = () => {
  const [data, setData] = useState([]);
  const [vistas, setVistas] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const notificados = useRef(new Set());

  const cargarDatos = () => {
    fetch("https://web-production-51989.up.railway.app/api/conversaciones")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);

    fetch("https://web-production-51989.up.railway.app/api/vistas")
      .then((res) => res.json())
      .then(setVistas)
      .catch(console.error);
  };

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(() => {
      cargarDatos();
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const conversacionesPorUsuario = data.reduce((acc, item) => {
    const actual = acc[item.userId] || { mensajes: [] };
    actual.mensajes = [...(actual.mensajes || []), item];
    if (!actual.lastInteraction || new Date(item.lastInteraction) > new Date(actual.lastInteraction)) {
      actual.lastInteraction = item.lastInteraction;
      actual.message = item.message;
    }
    acc[item.userId] = actual;
    return acc;
  }, {});

  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const pasada = new Date(fecha);
    const diffMs = ahora - pasada;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffMin < 1) return `hace unos segundos`;
    if (diffMin < 60) return `hace ${diffMin}m`;
    if (diffHrs < 24) return `hace ${diffHrs}h`;
    if (diffDays === 1) return "ayer";
    return `hace ${diffDays}d`;
  };

  const listaAgrupada = Object.entries(conversacionesPorUsuario).map(([userId, info]) => {
    const ultimaVista = vistas[userId];
    const nuevos = info.mensajes.filter(
      (m) => m.from === "usuario" && (!ultimaVista || new Date(m.lastInteraction) > new Date(ultimaVista))
    ).length;

    const ultimoUsuario = [...info.mensajes].reverse().find(m => m.from === "usuario");
    const minutosSinResponder = ultimoUsuario
      ? (Date.now() - new Date(ultimoUsuario.lastInteraction)) / 60000
      : Infinity;

    let estado = "Recurrente";
    if (info.mensajes.length === 1) estado = "Nuevo";
    else if (minutosSinResponder < 1) estado = "Activo";
    else estado = "Dormido";

    return {
      userId,
      ...info,
      nuevos,
      totalMensajes: info.mensajes.length,
      sinResponder: minutosSinResponder >= 1,
      estado,
    };
  });

  useEffect(() => {
    listaAgrupada.forEach(conv => {
      if (conv.estado === "Dormido" && conv.nuevos > 0 && !notificados.current.has(conv.userId)) {
        if (Notification.permission === "granted") {
          navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) {
              reg.showNotification("Nuevo mensaje en conversación dormida", {
                body: `ID: ${conv.userId}`,
                icon: "/icon-192x192.png",
              });
              notificados.current.add(conv.userId);
            }
          });
        }
      }
    });
  }, [listaAgrupada]);

  const filtrada = listaAgrupada.filter((item) =>
    item.userId.toLowerCase().includes(busqueda.toLowerCase())
  );

  const mensajesRecibidos = data.filter((m) => m.from === "usuario").length;
  const respuestasGPT = data.filter((m) => m.from === "asistente" && !m.manual).length;
  const respuestasPanel = data.filter((m) => m.from === "asistente" && m.manual).length;

  const getEstadoBadge = (estado) => {
    const colores = {
      Nuevo: "bg-green-500",
      Activo: "bg-blue-500",
      Dormido: "bg-gray-400",
    };
    return (
      <span className={`text-white text-xs px-2 py-1 rounded-full ${colores[estado] || "bg-gray-500"}`}>
        {estado}
      </span>
    );
  };

  return (
    <div>
      <Notificaciones />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-500">Mensajes recibidos</h2>
          <p className="text-2xl font-bold">{mensajesRecibidos}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-500">Respuestas GPT</h2>
          <p className="text-2xl font-bold">{respuestasGPT}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-500">Respuestas del panel</h2>
          <p className="text-2xl font-bold">{respuestasPanel}</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por ID de usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full sm:w-1/2 border border-gray-300 rounded px-4 py-2"
        />
      </div>

      <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-600 px-2 mb-2">
        <div>Usuario</div>
        <div>Estado</div>
        <div>Última interacción</div>
        <div>Mensaje</div>
        <div>Cantidad</div>
        <div>Detalles</div>
      </div>

      <div className="grid gap-4">
        {filtrada.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-4 grid grid-cols-6 gap-4 items-center text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.userId}</span>
              {item.nuevos > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.nuevos}
                </span>
              )}
            </div>
            <div>{getEstadoBadge(item.estado)}</div>
            <div>{formatearTiempo(item.lastInteraction)}</div>
            <div className="truncate">{item.message}</div>
            <div>{item.totalMensajes}</div>
            <div>
              <Link
                to={`/conversacion/${item.userId}`}
                className="bg-blue-600 text-white px-3 py-1 text-xs rounded-full hover:bg-blue-700"
              >
                Detalles
              </Link>
            </div>
          </div>
        ))}
        {filtrada.length === 0 && (
          <p className="text-gray-400 text-center py-6">
            No hay resultados para la búsqueda.
          </p>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUsuarioActual(user);
      setCargandoAuth(false);

      if (user) {
        try {
          const db = getFirestore(app);
          const agenteRef = doc(db, "agentes", user.uid);
          const agenteSnap = await getDoc(agenteRef);

          if (agenteSnap.exists()) {
            const datos = agenteSnap.data();
            localStorage.setItem("id-usuario-panel", user.uid);
            localStorage.setItem("rol-usuario-panel", datos.rol || "Soporte");
            localStorage.setItem("perfil-usuario-panel", JSON.stringify({
              nombre: datos.nombre || "",
              email: datos.email || user.email,
              foto: datos.foto || "",
              rol: datos.rol || "Soporte",
            }));

            window.dispatchEvent(new Event("actualizar-foto-perfil"));
          }
        } catch (error) {
          console.error("❌ Error obteniendo perfil del agente:", error);
        }
      }
    });
    return () => unsub();
  }, []);

  if (cargandoAuth) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            usuarioActual ? (
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Panel />} />
                  <Route path="/conversacion/:userId" element={<Detalle />} />
                  <Route path="/conversaciones" element={<Conversaciones />} />
                  <Route path="/agentes" element={<Agentes />} />
                  <Route path="/perfil" element={<Perfil />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
