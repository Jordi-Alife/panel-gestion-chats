import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Conversaciones = () => {
  const [data, setData] = useState([]);
  const [vistas, setVistas] = useState({});
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargar = () => {
      fetch("https://web-production-51989.up.railway.app/api/conversaciones")
        .then(res => res.json())
        .then(setData);

      fetch("https://web-production-51989.up.railway.app/api/vistas")
        .then(res => res.json())
        .then(setVistas);
    };

    cargar();
    const int = setInterval(cargar, 5000);
    return () => clearInterval(int);
  }, []);

  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const pasada = new Date(fecha);
    const diffMs = ahora - pasada;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffMin < 1) return "hace unos segundos";
    if (diffMin < 60) return `hace ${diffMin}m`;
    if (diffHrs < 24) return `hace ${diffHrs}h`;
    if (diffDays === 1) return "ayer";
    return `hace ${diffDays}d`;
  };

  const conversaciones = data.reduce((acc, item) => {
    const actual = acc[item.userId] || { mensajes: [] };
    actual.mensajes.push(item);
    if (!actual.lastInteraction || new Date(item.lastInteraction) > new Date(actual.lastInteraction)) {
      actual.lastInteraction = item.lastInteraction;
      actual.message = item.message;
    }
    acc[item.userId] = actual;
    return acc;
  }, {});

  const lista = Object.entries(conversaciones).map(([userId, info]) => {
    const ultimaVista = vistas[userId];
    const nuevos = info.mensajes.filter(m => m.from === "usuario" && (!ultimaVista || new Date(m.lastInteraction) > new Date(ultimaVista))).length;

    const ultimoUsuario = [...info.mensajes].reverse().find(m => m.from === "usuario");
    const minutosSinResponder = ultimoUsuario ? (Date.now() - new Date(ultimoUsuario.lastInteraction)) / 60000 : Infinity;

    let estado = "Recurrente";
    if (info.mensajes.length === 1) estado = "Nuevo";
    else if (minutosSinResponder < 1) estado = "Activo";
    else estado = "Dormido";

    return {
      userId,
      ...info,
      nuevos,
      totalMensajes: info.mensajes.length,
      estado,
    };
  });

  const filtrada = lista.filter((item) =>
    item.userId.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getEstadoBadge = (estado) => {
    const colores = {
      Nuevo: "bg-green-500",
      Activo: "bg-blue-500",
      Dormido: "bg-gray-400",
    };
    return (
      <span className={`text-white text-xs px-2 py-1 rounded-full ${colores[estado] || "bg-gray-500"}`}>{estado}</span>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por ID de usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full sm:w-1/2 border border-gray-300 rounded px-4 py-2"
        />
      </div>

      <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-600 px-2 mb-2">
        <div>Usuario</div>
        <div>Estado</div>
        <div>Última interacción</div>
        <div>Mensaje</div>
        <div>Cantidad</div>
        <div>Detalles</div>
      </div>

      <div className="grid gap-4">
        {filtrada.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-4 grid grid-cols-6 gap-4 items-center text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.userId}</span>
              {item.nuevos > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.nuevos}
                </span>
              )}
            </div>
            <div>{getEstadoBadge(item.estado)}</div>
            <div>{formatearTiempo(item.lastInteraction)}</div>
            <div className="truncate">{item.message}</div>
            <div>{item.totalMensajes}</div>
            <div>
              <Link
                to={`/conversacion/${item.userId}`}
                className="bg-blue-600 text-white px-3 py-1 text-xs rounded-full hover:bg-blue-700"
              >
                Detalles
              </Link>
            </div>
          </div>
        ))}
        {filtrada.length === 0 && (
          <p className="text-gray-400 text-center py-6">
            No hay resultados para la búsqueda.
          </p>
        )}
      </div>
    </div>
  );
};

export default Conversaciones;
