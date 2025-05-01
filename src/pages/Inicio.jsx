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
  const filtrarPorTiempo = (timestamp) => {
    const fecha = new Date(timestamp);
    const diferenciaMs = ahora - fecha;
    const dias = diferenciaMs / (1000 * 60 * 60 * 24);

    if (filtro === "hoy") return dias < 1;
    if (filtro === "semana") return dias < 7;
    if (filtro === "mes") return dias < 30;
    return true;
  };

  const mensajes = data.flatMap((c) => c.mensajes || []).filter((m) =>
    filtrarPorTiempo(m.lastInteraction)
  );

  const mensajesRecibidos = mensajes.filter((m) => m.from === "usuario").length;
  const respuestasGPT = mensajes.filter((m) => m.from === "asistente" && !m.manual).length;
  const respuestasPanel = mensajes.filter((m) => m.from === "asistente" && m.manual).length;

  const dataRecibidos = mensajes
    .filter((m) => m.from === "usuario")
    .map((m) => 1);
  const dataGPT = mensajes
    .filter((m) => m.from === "asistente" && !m.manual)
    .map((m) => 1);
  const dataPanel = mensajes
    .filter((m) => m.from === "asistente" && m.manual)
    .map((m) => 1);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold text-gray-700 mb-4">Resumen general</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFiltro("hoy")}
          className={`px-3 py-1 rounded-full text-sm ${
            filtro === "hoy"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Hoy
        </button>
        <button
          onClick={() => setFiltro("semana")}
          className={`px-3 py-1 rounded-full text-sm ${
            filtro === "semana"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Última semana
        </button>
        <button
          onClick={() => setFiltro("mes")}
          className={`px-3 py-1 rounded-full text-sm ${
            filtro === "mes"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Último mes
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-4 relative">
          <h2 className="text-sm text-gray-500">Mensajes recibidos</h2>
          <p className="text-3xl font-bold text-blue-600">{mensajesRecibidos}</p>
          <div className="absolute bottom-2 right-2 w-20 h-8">
            <Sparklines data={dataRecibidos} width={80} height={30}>
              <SparklinesLine color="#3b82f6" />
            </Sparklines>
          </div>
        </div>
        <div className="bg-white rounded shadow p-4 relative">
          <h2 className="text-sm text-gray-500">Respuestas GPT</h2>
          <p className="text-3xl font-bold text-green-600">{respuestasGPT}</p>
          <div className="absolute bottom-2 right-2 w-20 h-8">
            <Sparklines data={dataGPT} width={80} height={30}>
              <SparklinesLine color="#10b981" />
            </Sparklines>
          </div>
        </div>
        <div className="bg-white rounded shadow p-4 relative">
          <h2 className="text-sm text-gray-500">Respuestas humanas</h2>
          <p className="text-3xl font-bold text-orange-500">{respuestasPanel}</p>
          <div className="absolute bottom-2 right-2 w-20 h-8">
            <Sparklines data={dataPanel} width={80} height={30}>
              <SparklinesLine color="#f97316" />
            </Sparklines>
          </div>
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
