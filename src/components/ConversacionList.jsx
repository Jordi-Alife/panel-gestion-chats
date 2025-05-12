import React from "react";

const ConversacionList = ({
  conversaciones,
  userIdActual,
  onSelect,
  filtro,
  setFiltro,
  paisAToIso,
  formatearTiempo,
}) => {
  return (
    <div className="bg-white w-full h-full rounded-lg shadow-md overflow-y-auto">
      <h2 className="text-sm text-gray-400 font-semibold mb-2 px-4">Conversaciones</h2>

      <div className="flex gap-2 mb-3 px-4">
        {["todas", "gpt", "humanas"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-xs px-2 py-1 rounded-full border ${
              filtro === f ? "bg-blue-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {conversaciones.map((c) => (
        <div
          key={c.userId}
          onClick={() => onSelect(c.userId)}
          className={`flex items-center justify-between cursor-pointer px-4 py-3 rounded hover:bg-gray-100 ${
            c.userId === userIdActual ? "bg-blue-50" : ""
          }`}
        >
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                {c.iniciales}
              </div>
              {paisAToIso(c.pais) ? (
                <img
                  src={`https://flagcdn.com/16x12/${paisAToIso(c.pais)}.png`}
                  alt={c.pais}
                  className="absolute -bottom-1 -right-2 w-4 h-3 rounded-sm border"
                />
              ) : (
                <span className="absolute -bottom-1 -right-2 text-xs">🌐</span>
              )}
              {c.nuevos > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {c.nuevos}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-sm">{c.userId}</div>
              <div className="text-xs text-gray-500">{formatearTiempo(c.lastInteraction)}</div>
              {c.chatCerrado && (
                <div className="text-[10px] text-red-500 mt-1">⚠ Usuario ha cerrado el chat</div>
              )}
            </div>
          </div>
          <span
            className={`text-[10px] text-white px-2 py-0.5 rounded-full ${
              c.estado === "Activa"
                ? "bg-green-500"
                : c.estado === "Inactiva"
                ? "bg-gray-400"
                : "bg-black"
            }`}
          >
            {c.estado}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ConversacionList;
