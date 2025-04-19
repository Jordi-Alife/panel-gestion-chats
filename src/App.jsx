import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import Detalle from "./pages/Detalle";

const Panel = () => {
  const [data, setData] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const cargarDatos = () => {
    fetch("https://web-production-51989.up.railway.app/api/conversaciones")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 10000); // cada 10 segundos
    return () => clearInterval(interval); // limpieza al desmontar
  }, []);

  const conversacionesPorUsuario = data.reduce((acc, item) => {
    const actual = acc[item.userId];
    if (!actual || new Date(item.lastInteraction) > new Date(actual.lastInteraction)) {
      acc[item.userId] = item;
    }
    return acc;
  }, {});

  const listaAgrupada = Object.values(conversacionesPorUsuario);

  const filtrada = listaAgrupada.filter((item) =>
    item.userId.toLowerCase().includes(busqueda.toLowerCase())
  );

  const recibidos = listaAgrupada.length;
  const enviados = 0;
  const total = recibidos + enviados;

  const getMensajesNuevos = (userId, lastInteraction) => {
    const lastView = localStorage.getItem(`lastView-${userId}`);
    if (!lastView) return 1;
    return new Date(lastInteraction) > new Date(lastView) ? 1 : 0;
  };

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
            {filtrada.map((item, i) => {
              const nuevos = getMensajesNuevos(item.userId, item.lastInteraction);
              return (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 flex items-center gap-2">
                    {item.userId}
                    {nuevos > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {nuevos}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(item.lastInteraction).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 truncate max-w-xs">{item.message}</td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/conversacion/${item.userId}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
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
