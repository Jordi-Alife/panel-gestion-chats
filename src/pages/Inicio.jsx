import { useEffect, useState } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";

export default function Inicio() {
  const [data, setData] = useState([]);
  const [filtro, setFiltro] = useState("hoy");

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");
  const nombre = perfil.nombre || "Agente";

  const ahora = new Date();
  const hora = ahora.getHours();
  const saludo =
    hora < 12 ? "Buenos días" : hora < 20 ? "Buenas tardes" : "Buenas noches";

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

  // Agrupar mensajes por hora o día
  const agruparPorTiempo = (lista) => {
    const agrupados = {};
    lista.forEach((m) => {
      const fecha = new Date(m.lastInteraction);
      const clave =
        filtro === "hoy"
          ? fecha.getHours().toString().padStart(2, "0") // por hora
          : fecha.toISOString().split("T")[0]; // por día
      agrupados[clave] = (agrupados[clave] || 0) + 1;
    });

    const clavesOrdenadas = Object.keys(agrupados).sort();
    return clavesOrdenadas.map((k) => agrupados[k]);
  };

  const dataRecibidos = agruparPorTiempo(mensajesRecibidos);
  const dataGPT = agruparPorTiempo(respuestasGPT);
  const dataPanel = agruparPorTiempo(respuestasPanel);

  const Tarjeta = ({ titulo, valor, color, sparkData, cambio }) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col relative">
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
      <div className="mt-auto">
        <Sparklines data={sparkData} width={100} height={30}>
          <SparklinesLine color={color} />
        </Sparklines>
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
          valor={mensajesRecibidos.length}
          color="#3b82f6"
          sparkData={dataRecibidos}
          cambio={Math.random() * 10 - 5}
        />
        <Tarjeta
          titulo="Respuestas GPT"
          valor={respuestasGPT.length}
          color="#10b981"
          sparkData={dataGPT}
          cambio={Math.random() * 10 - 5}
        />
        <Tarjeta
          titulo="Respuestas humanas"
          valor={respuestasPanel.length}
          color="#f97316"
          sparkData={dataPanel}
          cambio={Math.random() * 10 - 5}
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
