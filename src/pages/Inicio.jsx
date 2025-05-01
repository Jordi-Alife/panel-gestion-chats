// src/pages/Inicio.jsx
import { useEffect, useState } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";

export default function Inicio() {
  const [data, setData] = useState([]);
  const [filtro, setFiltro] = useState("hoy");

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

  const ahora = new Date();
  const filtrarPorTiempo = (fecha) => {
    const f = new Date(fecha);
    const diffMs = ahora - f;
    if (filtro === "hoy") return diffMs <= 86400000;
    if (filtro === "semana") return diffMs <= 604800000;
    if (filtro === "mes") return diffMs <= 2592000000;
    return true;
  };

  const mensajesRecibidos = data
    .flatMap((c) => c.mensajes || [])
    .filter((m) => m.from === "usuario" && filtrarPorTiempo(m.lastInteraction));

  const respuestasGPT = data
    .flatMap((c) => c.mensajes || [])
    .filter((m) => m.from === "asistente" && !m.manual && filtrarPorTiempo(m.lastInteraction));

  const respuestasPanel = data
    .flatMap((c) => c.mensajes || [])
    .filter((m) => m.from === "asistente" && m.manual && filtrarPorTiempo(m.lastInteraction));

  const sparkMensajes = mensajesRecibidos.map((_, i) => Math.random() * 10 + i);
  const sparkGPT = respuestasGPT.map((_, i) => Math.random() * 5 + i);
  const sparkPanel = respuestasPanel.map((_, i) => Math.random() * 3 + i);

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">Resumen del asistente</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFiltro("hoy")}
          className={`text-sm px-3 py-1 rounded-full border ${
            filtro === "hoy" ? "bg-blue-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          Hoy
        </button>
        <button
          onClick={() => setFiltro("semana")}
          className={`text-sm px-3 py-1 rounded-full border ${
            filtro === "semana" ? "bg-blue-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          Última semana
        </button>
        <button
          onClick={() => setFiltro("mes")}
          className={`text-sm px-3 py-1 rounded-full border ${
            filtro === "mes" ? "bg-blue-600 text-white" : "bg-white text-gray-700"
          }`}
        >
          Último mes
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded shadow p-4 relative">
          <h2 className="text-sm text-gray-500">Mensajes recibidos</h2>
          <p className="text-3xl font-bold">{mensajesRecibidos.length}</p>
          <div className="absolute bottom-2 right-2 w-16 h-10 opacity-60">
            <Sparklines data={sparkMensajes}>
              <SparklinesLine color="#3b82f6" />
            </Sparklines>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 relative">
          <h2 className="text-sm text-gray-500">Respuestas GPT</h2>
          <p className="text-3xl font-bold">{respuestasGPT.length}</p>
          <div className="absolute bottom-2 right-2 w-16 h-10 opacity-60">
            <Sparklines data={sparkGPT}>
              <SparklinesLine color="#10b981" />
            </Sparklines>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 relative">
          <h2 className="text-sm text-gray-500">Respuestas del panel</h2>
          <p className="text-3xl font-bold">{respuestasPanel.length}</p>
          <div className="absolute bottom-2 right-2 w-16 h-10 opacity-60">
            <Sparklines data={sparkPanel}>
              <SparklinesLine color="#f97316" />
            </Sparklines>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-500">Preguntas frecuentes</h2>
          <p className="text-xs text-gray-400 italic mt-2">
            El análisis aparecerá aquí una vez implementado.
          </p>
        </div>
      </div>
    </div>
  );
}
