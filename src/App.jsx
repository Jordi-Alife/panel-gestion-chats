import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Detalle from "./pages/Detalle";

const Panel = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://web-production-51989.up.railway.app/api/conversaciones")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const recibidos = data.length;
  const enviados = 0; // Esto lo puedes actualizar después
  const total = recibidos + enviados;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Conversaciones</h1>

      <div className="mb-4">
        <p><strong>Mensajes recibidos</strong>: {recibidos}</p>
        <p><strong>Mensajes enviados</strong>: {enviados}</p>
        <p><strong>Total</strong>: {total}</p>
      </div>

      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2 text-left">Usuario</th>
            <th className="border px-4 py-2 text-left">Última interacción</th>
            <th className="border px-4 py-2 text-left">Mensaje</th>
            <th className="border px-4 py-2 text-left">Ver</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td className="border px-4 py-2">{item.userId}</td>
              <td className="border px-4 py-2">{new Date(item.lastInteraction).toLocaleString()}</td>
              <td className="border px-4 py-2 truncate max-w-xs">{item.message}</td>
              <td className="border px-4 py-2">
                <Link to={`/conversacion/${item.userId}`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Panel />} />
      <Route path="/conversacion/:userId" element={<Detalle />} />
    </Routes>
  </Router>
);

export default App;
