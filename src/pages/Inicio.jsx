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

  // Filtrado de datos por tiempo (hoy, última semana, último mes)
  const ahora = new Date();
  const filtrados = data.flatMap((c) =>
    (c.mensajes || []).filter((m) => {
      const fecha = new Date(m.lastInteraction);
      const diffHoras = (ahora - fecha) / 36e5;
      if (filtro === "hoy") return diffHoras <= 24;
      if (filtro === "semana") return diffHoras <= 24 * 7;
      if (filtro === "mes") return diffHoras <= 24 * 30;
      return true;
    })
  );

  const mensajesRecibidos = filtrados.filter((m) => m.from === "usuario").length;
  const respuestasGPT = filtrados.filter(
    (m) => m.from === "asistente" && !m.manual
  ).length;
  const respuestasPanel = filtrados.filter(
    (m) => m.from === "asistente" && m.manual
  ).length;

  // Para las gráficas, contar por horas en
