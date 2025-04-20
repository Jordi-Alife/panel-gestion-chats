// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import Detalle from "./pages/Detalle";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const Panel = () => {
  const [data, setData] = useState([]);
  const [vistas, setVistas] = useState({});
  const [busqueda, setBusqueda] = useState("");

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

    if (
      !actual.lastInteraction ||
      new Date(item.lastInteraction) > new Date(actual.lastInteraction)
    ) {
      actual.lastInteraction = item.lastInteraction;
      actual.message = item.message;
    }

    acc[item.userId] = actual;
    return acc;
  }, {});

  const listaAgrupada = Object.entries(conversacionesPorUsuario).map(
    ([userId, info]) => {
      const ultimaVista = vistas[userId];
      const nuevos = info.mensajes.filter(
        (m) =>
          m.from === "usuario" &&
          (!ultimaVista || new Date(m.lastInteraction) > new Date(ultimaVista))
      ).length;

      const ultimoMensaje = info.mensajes[info.mensajes.length - 1];
      const minutosSinResponder =
        ultimoMensaje?.from === "usuario"
          ? (Date.now() - new Date(ultimoMensaje.lastInteraction)) / 60000
          : 0;

      const tiempo = formatDistanceToNow(new Date(info.lastInteraction), {
        addSuffix: true,
        locale: es,
      });

      let estado = "Nuevo";
      if (info.mensajes.length > 1) {
        estado = minutosSinResponder < 1 ? "Activo" : "Dormido";
      }

      return {
        userId,
        ...info,
        nuevos,
        tiempo,
        estado,
      };
    }
  );

  const filtrada = listaAgrupada.filter((item) =>
    item.userId.toLowerCase().includes(busqueda.toLowerCase())
  );

  const mensajesRecibidos = data.filter((m) => m.from === "usuario").length;
  const respuestasGPT = data.filter((m) => m.from === "asistente" && !m.manual).length;
  const respuestasPanel = data.filter((m) => m.from === "asistente" && m.manual).length;

  return (
    <div>
      <header className="bg-[#1F2937] text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            src="/logo-nextlives.png"
            alt="NextLives"
            className="w-7 h-7"
          />
        </div>
        <h1 className="text-lg font-semibold">Panel de soporte</h1>
        <button className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded">
          Crear Canal Digital
        </button>
      </header>

      <main className="p-6 bg-gray-100 min-h-screen">
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

        <div className="bg-white rounded shadow overflow-hidden">
          <div className="bg-gray-100 grid grid-cols-6 gap-4 px-4 py-2 font-medium text-sm text-gray-600">
            <div>Usuario</div>
            <div>Estado</div>
            <div>Última interacción</div>
            <div>Mensaje</div>
            <div>Cantidad</div>
            <div>Detalles</div>
          </div>
          {filtrada.length === 0 ? (
            <p className="text-gray-400 text-center py-6">
              No hay resultados para la búsqueda.
            </p>
          ) : (
            filtrada.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-6 gap-4 px-4 py-3 items-center border-t hover:bg-gray-50 text-sm"
              >
                <div className="flex items-center gap-2">
                  {item.userId}
                  {item.nuevos > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {item.nuevos}
                    </span>
                  )}
                </div>
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.estado === "Nuevo"
                      ? "bg-yellow-100 text-yellow-700"
                      : item.estado === "Activo"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {item.estado}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{item.tiempo}</div>
                <div className="truncate max-w-xs">{item.message}</div>
                <div className="text-center">{item.mensajes.length}</div>
                <div>
                  <Link
                    to={`/conversacion/${item.userId}`}
                    className="text-white bg-blue-600 hover:bg-blue-700 rounded px-3 py-1 text-xs font-medium"
                  >
                    Detalles
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <Router>
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Panel />} />
        <Route path="/conversacion/:userId" element={<Detalle />} />
      </Routes>
    </DashboardLayout>
  </Router>
);

export default App;
