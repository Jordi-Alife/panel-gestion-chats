// src/pages/Inicio.jsx
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function Inicio() {
  const [data, setData] = useState([]);
  const [filtro, setFiltro] = useState("hoy");

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");
  const nombre = perfil.nombre || "Agente";

  const ahora = new Date();
  const hora = ahora.getHours();
  const saludo =
    hora < 12
      ? "Buenos días"
      : hora < 20
      ? "Buenas tardes"
      : "Buenas noches";

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

  const filtrarPorTiempo = (timestamp, periodo) => {
    const fecha = new Date(timestamp);
    const diffMs = ahora - fecha;
    const dias = diffMs / (1000 * 60 * 60 * 24);
    if (periodo === "hoy") return dias < 1;
    if (periodo === "semana") return dias < 7;
    if (periodo === "mes") return dias < 30;
    return true;
  };

  const mensajes = data.flatMap((c) => c.mensajes || []);

  const mensajesActual = mensajes.filter((m) => filtrarPorTiempo(m.lastInteraction, filtro));
  const mensajesPrevio = mensajes.filter((m) => {
    const fecha = new Date(m.lastInteraction);
    const diffMs = ahora - fecha;
    const dias = diffMs / (1000 * 60 * 60 * 24);
    if (filtro === "hoy") return dias >= 1 && dias < 2;
    if (filtro === "semana") return dias >= 7 && dias < 14;
    if (filtro === "mes") return dias >= 30 && dias < 60;
    return false;
  });

  const contar = (array, filtro) =>
    array.filter((m) => filtro(m)).length;

  const mensajesRecibidos = contar(mensajesActual, (m) => m.from === "usuario");
  const respuestasGPT = contar(mensajesActual, (m) => m.from === "asistente" && !m.manual);
  const respuestasPanel = contar(mensajesActual, (m) => m.from === "asistente" && m.manual);

  const mensajesRecibidosPrev = contar(mensajesPrevio, (m) => m.from === "usuario");
  const respuestasGPTPrev = contar(mensajesPrevio, (m) => m.from === "asistente" && !m.manual);
  const respuestasPanelPrev = contar(mensajesPrevio, (m) => m.from === "asistente" && m.manual);

  const calcularCambio = (actual, previo) => {
    if (previo === 0) return actual > 0 ? 100 : 0;
    return ((actual - previo) / previo) * 100;
  };

  const cambioRecibidos = calcularCambio(mensajesRecibidos, mensajesRecibidosPrev);
  const cambioGPT = calcularCambio(respuestasGPT, respuestasGPTPrev);
  const cambioPanel = calcularCambio(respuestasPanel, respuestasPanelPrev);

  const agruparPorHora = (mensajesFiltrados) => {
    const conteo = {};
    mensajesFiltrados.forEach((m) => {
      const fecha = new Date(m.lastInteraction);
      const key = `${fecha.getHours()}:00`;
      conteo[key] = (conteo[key] || 0) + 1;
    });
    return Object.entries(conteo).map(([hora, cantidad]) => ({
      hora,
      cantidad,
    }));
  };

  const dataRecibidos = agruparPorHora(
    mensajesActual.filter((m) => m.from === "usuario")
  );
  const dataGPT = agruparPorHora(
    mensajesActual.filter((m) => m.from === "asistente" && !m.manual)
  );
  const dataPanel = agruparPorHora(
    mensajesActual.filter((m) => m.from === "asistente" && m.manual)
  );

  const Tarjeta = ({ titulo, valor, color, dataChart, cambio }) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col relative">
      <div className="flex justify-between items-start">
        <h2 className="text-sm text-gray-500">{titulo}</h2>
        <div
          className={`text-xs ${
            cambio >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {cambio >= 0 ? "▲" : "▼"} {Math.abs(cambio).toFixed(2)}%
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-800 mt-1">{valor}</p>
      <div className="h-20 -ml-4 -mr-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataChart}>
            <defs>
              <linearGradient id={`color${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hora" hide />
            <YAxis hide />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="cantidad"
              stroke={color}
              fill={`url(#color${color})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          {saludo}, {nombre}
        </h1>
        <div>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none"
          >
            <option value="hoy">Hoy</option>
            <option value="semana">Última semana</option>
            <option value="mes">Último mes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tarjeta
          titulo="Mensajes recibidos"
          valor={mensajesRecibidos}
          color="#3b82f6"
          dataChart={dataRecibidos}
          cambio={cambioRecibidos}
        />
        <Tarjeta
          titulo="Respuestas GPT"
          valor={respuestasGPT}
          color="#10b981"
          dataChart={dataGPT}
          cambio={cambioGPT}
        />
        <Tarjeta
          titulo="Respuestas humanas"
          valor={respuestasPanel}
          color="#f97316"
          dataChart={dataPanel}
          cambio={cambioPanel}
        />
      </div>

      <h1 className="text-lg font-semibold text-gray-700 mt-8">
        Resúmenes automáticos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 h-40 flex flex-col">
          <h2 className="text-sm text-gray-500 mb-2">Resumen diario</h2>
          <p className="text-sm text-gray-400 flex-1">Todavía no generado</p>
          <p className="text-xs text-right text-gray-300">GPT</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 h-40 flex flex-col">
          <h2 className="text-sm text-gray-500 mb-2">Resumen semanal</h2>
          <p className="text-sm text-gray-400 flex-1">Todavía no generado</p>
          <p className="text-xs text-right text-gray-300">GPT</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 h-40 flex flex-col">
          <h2 className="text-sm text-gray-500 mb-2">Resumen mensual</h2>
          <p className="text-sm text-gray-400 flex-1">Todavía no generado</p>
          <p className="text-xs text-right text-gray-300">GPT</p>
        </div>
      </div>
    </div>
  );
}
