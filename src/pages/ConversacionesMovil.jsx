import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ConversacionesMovil = () => {
  const navigate = useNavigate();
  const [todasConversaciones, setTodasConversaciones] = useState([]);
  const [filtro, setFiltro] = useState("todas");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch("https://web-production-51989.up.railway.app/api/conversaciones");
        const data = await res.json();
        setTodasConversaciones(data);
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

  const listaFiltrada = todasConversaciones.filter(
    (c) =>
      filtro === "todas" ||
      (filtro === "gpt" && !c.intervenida) ||
      (filtro === "humanas" && c.intervenida)
  );

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Buscar conversaciones..."
          className="w-full border rounded-full px-4 py-2 text-sm focus:outline-none"
        />
      </div>

      {/* LISTA DE CONVERSACIONES */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {listaFiltrada.map((c) => (
          <div
            key={c.userId}
            onClick={() => navigate(`/conversaciones/${c.userId}`)}
            className="flex items-center justify-between bg-white rounded-lg shadow p-3 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                {c.userId.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-sm">{c.userId}</div>
                <div className="text-xs text-gray-500">
                  {paisAToIso(c.pais) ? (
                    <img
                      src={`https://flagcdn.com/16x12/${paisAToIso(c.pais)}.png`}
                      alt={c.pais}
                      className="inline-block ml-1"
                    />
                  ) : (
                    <span className="ml-1">🌐</span>
                  )}
                  {c.chatCerrado && (
                    <span className="ml-2 text-red-500 text-[10px]">Cerrado</span>
                  )}
                </div>
              </div>
            </div>
            {c.nuevos > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                {c.nuevos}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* MENÚ INFERIOR */}
      <div className="flex justify-around border-t bg-white py-2">
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
