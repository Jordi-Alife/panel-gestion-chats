import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ConversacionesMovil = () => {
  const navigate = useNavigate();
  const [todasConversaciones, setTodasConversaciones] = useState([]);
  const [vistas, setVistas] = useState({});
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch("https://web-production-51989.up.railway.app/api/conversaciones");
        const data = await res.json();
        setTodasConversaciones(data);

        const vistasRes = await fetch("https://web-production-51989.up.railway.app/api/vistas");
        const vistasData = await vistasRes.json();
        setVistas(vistasData);
      } catch (err) {
        console.error(err);
      }
    };

    cargarDatos();
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const paisAToIso = (paisTexto) => {
    const mapa = {
      Spain: "es",
      France: "fr",
      Italy: "it",
      Mexico: "mx",
      Argentina: "ar",
      Colombia: "co",
      Chile: "cl",
      Peru: "pe",
      "United States": "us",
    };
    return mapa[paisTexto] ? mapa[paisTexto].toLowerCase() : null;
  };

  const tiempoRelativo = (fecha) => {
    const ahora = new Date();
    const diffMs = ahora - new Date(fecha);
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 1) return "ahora";
    if (diffMin < 60) return `hace ${diffMin}m`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `hace ${diffHrs}h`;
    const diffDias = Math.floor(diffHrs / 24);
    return `hace ${diffDias}d`;
  };

  const conversacionesPorUsuario = todasConversaciones.reduce((acc, item) => {
    const actual = acc[item.userId] || { mensajes: [], estado: "Archivado" };
    actual.mensajes = [...(actual.mensajes || []), ...(item.mensajes || [])];
    actual.pais = item.pais;
    actual.intervenida = item.intervenida || false;
    actual.estadoConversacion = item.estado || "abierta";
    acc[item.userId] = actual;
    return acc;
  }, {});

  const listaAgrupada = Object.entries(conversacionesPorUsuario)
    .map(([id, info]) => {
      const ultimaVista = vistas[id];
      const mensajesValidos = Array.isArray(info.mensajes) ? info.mensajes : [];
      const ultimoMensaje = mensajesValidos.sort(
        (a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction)
      )[0];
      const minutosDesdeUltimo = ultimoMensaje
        ? (Date.now() - new Date(ultimoMensaje.lastInteraction)) / 60000
        : Infinity;

      let estado = "Archivado";
      if (info.estadoConversacion === "cerrado") {
        estado = "Cerrado";
      } else if (minutosDesdeUltimo <= 2) {
        estado = "Activa";
      } else if (minutosDesdeUltimo <= 10) {
        estado = "Inactiva";
      }

      const nuevos = mensajesValidos.filter(
        (m) =>
          m.from?.toLowerCase() === "usuario" &&
          (!ultimaVista || new Date(m.lastInteraction) > new Date(ultimaVista))
      ).length;

      return {
        userId: id,
        nuevos,
        estado,
        lastInteraction: ultimoMensaje ? ultimoMensaje.lastInteraction : null,
        iniciales: id.slice(0, 2).toUpperCase(),
        intervenida: info.intervenida || false,
        pais: info.pais || "Desconocido",
      };
    })
    .sort((a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction))
    .filter(
      (c) =>
        (filtro === "todas" ||
          (filtro === "gpt" && !c.intervenida) ||
          (filtro === "humanas" && c.intervenida)) &&
        c.userId.toLowerCase().includes(busqueda.toLowerCase())
    );

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b flex items-center gap-2">
        <button onClick={() => navigate("/")} className="text-xl">
          ←
        </button>
        <input
          type="text"
          placeholder="Buscar conversaciones..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={`w-10/12 border rounded-full px-4 py-2 text-sm focus:outline-none transition-all duration-200 ease-in-out ${
            busqueda.trim() ? "ring-2 ring-blue-400" : ""
          }`}
          style={{ fontSize: "16px" }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3 pb-24">
        {listaAgrupada.map((c) => (
          <div
            key={c.userId}
            onClick={() => navigate(`/conversaciones/${c.userId}`)}
            className="flex items-center justify-between bg-white rounded-lg shadow p-4 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-300 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
                {c.iniciales}
              </div>
              <div>
                <div className="font-medium text-base">{c.userId}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  {paisAToIso(c.pais) ? (
                    <img
                      src={`https://flagcdn.com/16x12/${paisAToIso(c.pais)}.png`}
                      alt={c.pais}
                      className="inline-block"
                    />
                  ) : (
                    <span>🌐</span>
                  )}
                  {c.lastInteraction && (
                    <span className="ml-2 text-gray-400">{tiempoRelativo(c.lastInteraction)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {c.nuevos > 0 && (
                <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {c.nuevos}
                </span>
              )}
              <span
                className={`text-xs uppercase tracking-wide px-3 py-1 rounded-2xl font-semibold fade-in ${
                  c.estado === "Activa"
                    ? "bg-green-100 text-green-700"
                    : c.estado === "Inactiva"
                    ? "bg-yellow-100 text-yellow-700"
                    : c.estado === "Cerrado"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {c.estado}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-around items-center border-t bg-white py-8">
        <button
          onClick={() => setFiltro("todas")}
          className={`text-sm ${
            filtro === "todas" ? "text-blue-600 font-semibold" : "text-gray-600"
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFiltro("gpt")}
          className={`text-sm ${
            filtro === "gpt" ? "text-blue-600 font-semibold" : "text-gray-600"
          }`}
        >
          GPT
        </button>
        <button
          onClick={() => setFiltro("humanas")}
          className={`text-sm ${
            filtro === "humanas" ? "text-blue-600 font-semibold" : "text-gray-600"
          }`}
        >
          Humanas
        </button>
      </div>
    </div>
  );
};

export default ConversacionesMovil;
