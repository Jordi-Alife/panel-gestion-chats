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

  // Filtrar mensajes según filtro seleccionado
  const ahora = new Date();
  const filtrados = data.filter((m) => {
    const fecha = new Date(m.lastInteraction);
    if (filtro === "hoy") return fecha.toDateString() === ahora.toDateString();
    if (filtro === "semana") {
      const sieteDias = new Date();
      sieteDias.setDate(ahora.getDate() - 7);
      return fecha >= sieteDias;
    }
    if (filtro === "mes") {
      const unMes = new Date();
      unMes.setMonth(ahora.getMonth() - 1);
      return fecha >= unMes;
    }
    return true;
  });

  const mensajesRecibidos = filtrados.filter((m) => m.from === "usuario").length;
  const respuestasGPT = filtrados.filter((m) => m.from === "asistente" && !m.manual).length;
  const respuestasPanel = filtrados.filter((m) => m.from === "asistente" && m.manual).length;

  // Datos simples para la minigráfica (puedes ajustar con valores reales si tienes)
  const ejemploGrafica = [5, 10, 7, 12, 8, 15, 9];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Resumen del asistente</h1>

      <div className="mb-4 flex gap-2">
        {["hoy", "semana", "mes"].map((op) => (
          <button
            key={op}
            onClick={() => setFiltro(op)}
            className={`px-3 py-1 rounded-full border ${
              filtro === op ? "bg-blue-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            {op === "hoy" ? "Hoy" : op === "semana" ? "Última semana" : "Último mes"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-4 relative">
          <h2 className="text-sm text-gray-500">Mensajes recibidos</h2>
          <p className="text-2xl font-bold">{mensajesRecibidos}</p>
          <div className="absolute bottom-2 right-2 w-20">
            <Sparklines data={ejemploGrafica}>
              <SparklinesLine color="#3b82f6" />
            </Sparklines>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 relative">
          <h2 className="text-sm text-gray-500">Respuestas GPT</h2>
          <p className="text-2xl font-bold">{respuestasGPT}</p>
          <div className="absolute bottom-2 right-2 w-20">
            <Sparklines data={ejemploGrafica}>
              <SparklinesLine color="#22c55e" />
            </Sparklines>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 relative">
          <h2 className="text-sm text-gray-500">Respuestas del panel</h2>
          <p className="text-2xl font-bold">{respuestasPanel}</p>
          <div className="absolute bottom-2 right-2 w-20">
            <Sparklines data={ejemploGrafica}>
              <SparklinesLine color="#f97316" />
            </Sparklines>
          </div>
        </div>
      </div>
    </div>
  );
}
