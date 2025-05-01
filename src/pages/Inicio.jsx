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

  const mensajesRecibidos = data
    .flatMap((c) => c.mensajes || [])
    .filter((m) => m.from === "usuario").length;

  const respuestasGPT = data
    .flatMap((c) => c.mensajes || [])
    .filter((m) => m.from === "asistente" && !m.manual).length;

  const respuestasPanel = data
    .flatMap((c) => c.mensajes || [])
    .filter((m) => m.from === "asistente" && m.manual).length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold text-gray-700 mb-4">Resumen general</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-500">Mensajes recibidos</h2>
          <p className="text-3xl font-bold text-blue-600">{mensajesRecibidos}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-500">Respuestas GPT</h2>
          <p className="text-3xl font-bold text-green-600">{respuestasGPT}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-500">Respuestas humanas</h2>
          <p className="text-3xl font-bold text-orange-500">{respuestasPanel}</p>
        </div>
      </div>

      <h1 className="text-lg font-semibold text-gray-700 mt-8">Resúmenes automáticos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-4 h-40 flex flex-col">
          <h2 className="text-sm text-gray-500 mb-2">Resumen diario</h2>
          <p className="text-sm text-gray-400 flex-1">Todavía no generado</p>
          <p className="text-xs text-right text-gray-300">GPT</p>
        </div>
        <div className="bg-white rounded shadow p-4 h-40 flex flex-col">
          <h2 className="text-sm text-gray-500 mb-2">Resumen semanal</h2>
          <p className="text-sm text-gray-400 flex-1">Todavía no generado</p>
          <p className="text-xs text-right text-gray-300">GPT</p>
        </div>
        <div className="bg-white rounded shadow p-4 h-40 flex flex-col">
          <h2 className="text-sm text-gray-500 mb-2">Resumen mensual</h2>
          <p className="text-sm text-gray-400 flex-1">Todavía no generado</p>
          <p className="text-xs text-right text-gray-300">GPT</p>
        </div>
      </div>
    </div>
  );
}
