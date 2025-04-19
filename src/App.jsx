// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import Detalle from "./pages/Detalle";

const Panel = () => {
  const [data, setData] = useState([]);
  const [vistas, setVistas] = useState({});
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("https://web-production-51989.up.railway.app/api/conversaciones")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);

    fetch("https://web-production-51989.up.railway.app/api/vistas")
      .then((res) => res.json())
      .then(setVistas)
      .catch(console.error);
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

      return {
        userId,
        ...info,
        nuevos,
        sinResponder: minutosSinResponder >= 1,
      };
    }
  );

  const filtrada = listaAgrupada.filter((item) =>
    item.userId.toLowerCase().includes(busqueda.toLowerCase())
  );

  const recibidos = listaAgrupada.length;
  const enviados = 0;
  const total = recibidos + enviados;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-500">Recibidos</h2>
          <p className="text-2xl font-bold">{recibidos}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-500">Enviados</h2>
          <p className="text-2xl font-bold">{enviados}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-500">Total</h2>
          <p className="text-2xl font-bold">{total}</p>
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

      <div className="overflow-auto">
        <table className="table-auto w-full bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Última interacción</th>
              <th className="px-4 py-2">Mensaje</th>
              <th className="px-4 py-2">Ver</th>
            </tr>
          </thead>
          <tbody>
            {filtrada.map((item, i) => (
              <tr
                key={i}
                className={`border-t hover:bg-gray-50 ${
                  item.sinResponder ? "bg-gray-100" : ""
                }`}
              >
                <td className="px-4 py-2 flex items-center gap-2">
                  {item.userId}
                  {item.nuevos > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.nuevos}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {new Date(item.lastInteraction).toLocaleString()}
                </td>
                <td className="px-4 py-2 truncate max-w-xs">{item.message}</td>
                <td className="px-4 py-2 flex items-center gap-2">
                  <Link
                    to={`/conversacion/${item.userId}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ver
                  </Link>
                  {item.sinResponder && (
                    <span title="Sin respuesta reciente" className="text-gray-500 text-lg">
                      💤
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
