// src/pages/Detalle.jsx
import { useEffect, useState } from "react";

export default function Detalle() {
  const [data, setData] = useState([]);

  const cargarDatos = () => {
    fetch("https://web-production-51989.up.railway.app/api/conversaciones")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  };

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const mensajesRecibidos = data.filter((m) => m.from === "usuario").length;
  const respuestasGPT = data.filter((m) => m.from === "asistente" && !m.manual).length;
  const respuestasPanel = data.filter((m) => m.from === "asistente" && m.manual).length;

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
    </div>
  );
}
