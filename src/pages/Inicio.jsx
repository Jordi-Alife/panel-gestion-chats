// src/pages/Inicio.jsx
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Inicio() {
  const [data, setData] = useState([]);
  const [filtro, setFiltro] = useState("hoy");

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");
  const nombre = perfil.nombre || "Agente";

  const ahora = new Date();
  const hora = ahora.getHours();
  const saludo =
    hora < 12 ? "Buenos días" : hora < 20 ? "Buenas tardes" : "Buenas noches";

  const cargarDatos = async () => {
  try {
    const res = await fetch("https://web-production-51989.up.railway.app/api/conversaciones");
    const conversaciones = await res.json();

    const conversacionesConMensajes = await Promise.all(
      conversaciones.map(async (conv) => {
        try {
          const resMensajes = await fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${conv.userId}`);
          const mensajes = await resMensajes.json();
          return { ...conv, mensajes };
        } catch (e) {
          console.warn("Error cargando mensajes para", conv.userId, e);
          return { ...conv, mensajes: [] };
        }
      })
    );

    setData(conversacionesConMensajes);
  } catch (error) {
    console.error("❌ Error al cargar datos:", error);
  }
};

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const filtrarPorTiempo = (timestamp) => {
    const fecha = new Date(timestamp);
    const diffMs = ahora - fecha;
    const dias = diffMs / (1000 * 60 * 60 * 24);
    if (filtro === "hoy") return dias < 1;
    if (filtro === "semana") return dias < 7;
    if (filtro === "mes") return dias < 30;
    return true;
  };

  const mensajes = data.flatMap((c) => c.mensajes || []).filter((m) =>
    filtrarPorTiempo(m.lastInteraction)
  );

  const mensajesRecibidos = mensajes.filter((m) => m.from === "usuario");
  const respuestasGPT = mensajes.filter((m) => m.from === "asistente" && !m.manual);
  const respuestasPanel = mensajes.filter((m) => m.from === "asistente" && m.manual);
  const mensajesTotales = respuestasGPT.length + respuestasPanel.length;

  const chatsEnPeriodo = data.filter((c) =>
    (c.mensajes || []).some((m) => filtrarPorTiempo(m.lastInteraction))
  );

  const promedioMensajesPorChat = chatsEnPeriodo.length
    ? Math.round(mensajes.length / chatsEnPeriodo.length)
    : 0;

  const crearDatosGrafica = (mensajesFiltrados) => {
    const porHora = {};
    mensajesFiltrados.forEach((m) => {
      const fecha = new Date(m.lastInteraction);
      const clave = `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()} ${fecha.getHours()}:00`;
      porHora[clave] = (porHora[clave] || 0) + 1;
    });
    return Object.entries(porHora).map(([hora, cantidad]) => ({ hora, cantidad }));
  };

  const dataRecibidos = crearDatosGrafica(mensajesRecibidos);
  const dataGPT = crearDatosGrafica(respuestasGPT);
  const dataPanel = crearDatosGrafica(respuestasPanel);
  const dataTotalChats = crearDatosGrafica(
    chatsEnPeriodo.flatMap((c) => c.mensajes || [])
  );

  const dataPromedioMensajes = (() => {
    const agrupados = {};
    chatsEnPeriodo.forEach((c) => {
      c.mensajes.forEach((m) => {
        const fecha = new Date(m.lastInteraction);
        const clave = `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()} ${fecha.getHours()}:00`;
        if (!agrupados[clave]) agrupados[clave] = { mensajes: 0, chats: new Set() };
        agrupados[clave].mensajes += 1;
        agrupados[clave].chats.add(c.userId);
      });
    });
    return Object.entries(agrupados).map(([hora, obj]) => ({
      hora,
      cantidad: obj.chats.size > 0
        ? Math.round(obj.mensajes / obj.chats.size)
        : 0,
    }));
  })();

  const Tarjeta = ({ titulo, valor, color, datos }) => (
    <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow p-4 flex flex-col">
      <h2 className="text-sm text-gray-500 dark:text-gray-300">{titulo}</h2>
<p className="text-3xl font-bold text-gray-800 dark:text-white">{valor}</p>
      <div className="flex-1 mt-2">
        <ResponsiveContainer width="100%" height={50}>
          <AreaChart data={datos}>
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
              isAnimationActive={false}
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
          titulo="Total Chats"
          valor={chatsEnPeriodo.length}
          color="#0ea5e9"
          datos={dataTotalChats}
        />
        <Tarjeta
          titulo="Mensajes recibidos"
          valor={mensajesRecibidos.length}
          color="#3b82f6"
          datos={dataRecibidos}
        />
        <Tarjeta
          titulo="Mensajes totales enviados"
          valor={mensajesTotales}
          color="#8b5cf6"
          datos={crearDatosGrafica([...respuestasGPT, ...respuestasPanel])}
        />
        <Tarjeta
          titulo="Respuestas GPT"
          valor={respuestasGPT.length}
          color="#10b981"
          datos={dataGPT}
        />
        <Tarjeta
          titulo="Respuestas humanas"
          valor={respuestasPanel.length}
          color="#f97316"
          datos={dataPanel}
        />
        <Tarjeta
          titulo="Promedio de mensajes por chat"
          valor={promedioMensajesPorChat}
          color="#ef4444"
          datos={dataPromedioMensajes}
        />
      </div>

      <h1 className="text-lg font-semibold text-gray-700 mt-8">Resúmenes automáticos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow p-4 h-40 flex flex-col">
          <h2 className="text-sm text-gray-500 mb-2">Resumen diario</h2>
          <p className="text-sm text-gray-400 flex-1">Todavía no generado</p>
          <p className="text-xs text-right text-gray-300">GPT</p>
        </div>
        <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow p-4 h-40 flex flex-col">
          <h2 className="text-sm text-gray-500 mb-2">Resumen semanal</h2>
          <p className="text-sm text-gray-400 flex-1">Todavía no generado</p>
          <p className="text-xs text-right text-gray-300">GPT</p>
        </div>
        <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow p-4 h-40 flex flex-col">
          <h2 className="text-sm text-gray-500 mb-2">Resumen mensual</h2>
          <p className="text-sm text-gray-400 flex-1">Todavía no generado</p>
          <p className="text-xs text-right text-gray-300">GPT</p>
        </div>
      </div>
    </div>
  );
}
