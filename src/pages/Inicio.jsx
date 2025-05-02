import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

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

  const filtrarPorTiempo = (timestamp, periodo = "actual") => {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const dias = diffMs / (1000 * 60 * 60 * 24);

    if (filtro === "hoy") return periodo === "actual" ? dias < 1 : dias >=1 && dias < 2;
    if (filtro === "semana") return periodo === "actual" ? dias < 7 : dias >=7 && dias < 14;
    if (filtro === "mes") return periodo === "actual" ? dias < 30 : dias >=30 && dias < 60;
    return true;
  };

  const mensajes = data.flatMap((c) => c.mensajes || []);

  const mensajesActuales = mensajes.filter((m) => filtrarPorTiempo(m.lastInteraction, "actual"));
  const mensajesPrevios = mensajes.filter((m) => filtrarPorTiempo(m.lastInteraction, "previo"));

  const contar = (array, filtro) => array.filter(filtro).length;

  const countRecibidos = contar(mensajesActuales, (m) => m.from === "usuario");
  const countGPT = contar(mensajesActuales, (m) => m.from === "asistente" && !m.manual);
  const countPanel = contar(mensajesActuales, (m) => m.from === "asistente" && m.manual);

  const prevRecibidos = contar(mensajesPrevios, (m) => m.from === "usuario");
  const prevGPT = contar(mensajesPrevios, (m) => m.from === "asistente" && !m.manual);
  const prevPanel = contar(mensajesPrevios, (m) => m.from === "asistente" && m.manual);

  const calcCambio = (actual, previo) =>
    previo === 0 ? 0 : ((actual - previo) / previo) * 100;

  const cambioRecibidos = calcCambio(countRecibidos, prevRecibidos);
  const cambioGPT = calcCambio(countGPT, prevGPT);
  const cambioPanel = calcCambio(countPanel, prevPanel);

  const dataRecibidos = mensajesActuales
    .filter((m) => m.from === "usuario")
    .map((m, i) => ({ x: i, y: 1 }));
  const dataGPT = mensajesActuales
    .filter((m) => m.from === "asistente" && !m.manual)
    .map((m, i) => ({ x: i, y: 1 }));
  const dataPanel = mensajesActuales
    .filter((m) => m.from === "asistente" && m.manual)
    .map((m, i) => ({ x: i, y: 1 }));

  const Tarjeta = ({ titulo, valor, color, data, cambio }) => (
    <div className="bg-white rounded-lg p-4 flex flex-col shadow-sm">
      <div className="flex justify-between items-start">
        <h2 className="text-sm text-gray-500">{titulo}</h2>
        <div
          className={`text-xs flex items-center ${
            cambio >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {cambio >= 0 ? "▲" : "▼"} {Math.abs(cambio).toFixed(2)}%
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-800 mt-1">{valor}</p>
      <div className="h-24 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <Area
              type="monotone"
              dataKey="y"
              stroke={color}
              fill={color}
              fillOpacity={0.1}
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
        <div className="relative">
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
          valor={countRecibidos}
          color="#3b82f6"
          data={dataRecibidos}
          cambio={cambioRecibidos}
        />
        <Tarjeta
          titulo="Respuestas GPT"
          valor={countGPT}
          color="#10b981"
          data={dataGPT}
          cambio={cambioGPT}
        />
        <Tarjeta
          titulo="Respuestas humanas"
          valor={countPanel}
          color="#f97316"
          data={dataPanel}
          cambio={cambioPanel}
        />
      </div>

      <h1 className="text-lg font-semibold text-gray-700 mt-8">Resúmenes automáticos</h1>

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
