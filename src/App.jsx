// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import Detalle from "./pages/Detalle";

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

      let estado = "Recurrente";
      if (info.mensajes.length === 1) {
        estado = "Nuevo";
      } else if (minutosSinResponder < 1) {
        estado = "Activo";
      } else {
        estado = "Dormido";
      }

      return {
        userId,
        ...info,
        nuevos,
        totalMensajes: info.mensajes.length,
        sinResponder: minutosSinResponder >= 1,
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

  const getEstadoBadge = (estado) => {
    const colores = {
      Nuevo: "bg-green-500",
      Activo: "bg-blue-500",
      Dormido: "bg-gray-400",
    };
    return (
      <span
        className={`text-white text-xs px-2 py-1 rounded-full ${colores[estado] || "bg-gray-500"}`}
      >
        {estado}
      </span>
    );
  };

  return (
    <div>
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

      <div className="grid gap-4">
        {filtrada.map((item, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <div className="font-semibold text-lg">{item.userId}</div>
                <div className="text-sm text-gray-500">
                  Última interacción: {new Date(item.lastInteraction).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                {getEstadoBadge(item.estado)}
                {item.nuevos > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.nuevos} nuevos
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-700 truncate mb-2">
              {item.message}
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>{item.totalMensajes} mensajes</div>
              <Link
                to={`/conversacion/${item.userId}`}
                className="text-blue-600 hover:underline font-medium"
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
