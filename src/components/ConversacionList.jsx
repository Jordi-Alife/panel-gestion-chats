import React, { useState } from "react";

const ConversacionList = ({
  conversaciones,
  userIdActual,
  onSelect,
  filtro,
  setFiltro,
  paisAToIso,
  formatearTiempo,
}) => {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = conversaciones.filter((c) => {
    const texto = busqueda.toLowerCase();
    return (
      c.userId.toLowerCase().includes(texto) ||
      (c.estado || "").toLowerCase().includes(texto)
    );
  });

  return (
    <div className="bg-white dark:bg-gray-900 w-full h-full rounded-lg shadow-md flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b dark:border-gray-700">
        <input
          type="text"
          placeholder="Buscar conversaciones..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border rounded-full px-4 py-2 text-sm focus:outline-none transition-all duration-200 ease-in-out dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          style={{ fontSize: "14px" }}
        />
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
        {filtradas.map((c) => (
          <div
            key={c.userId}
            onClick={() => onSelect(c.userId)}
            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition ${
              c.userId === userIdActual ? "bg-blue-50 dark:bg-blue-950" : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center gap-3 relative">
              <div className="relative">
                <div className="bg-gray-300 dark:bg-gray-600 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 dark:text-white">
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
                {c.noVistos > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {c.noVistos}
                  </span>
                )}
              </div>
              <div>
                <div className="font-medium text-sm text-gray-800 dark:text-white">{c.userId}</div>

                <div className="text-xs text-gray-600 dark:text-gray-300 max-w-[160px] truncate">
                  {c.lastMessage?.tipo === "imagen"
                    ? "📷 Imagen enviada"
                    : typeof c.lastMessage?.contenido === "string"
                    ? c.lastMessage.contenido.slice(0, 30)
                    : "—"}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-[11px] opacity-70">{formatearTiempo(c.lastInteraction)}</span>
                </div>

                {c.chatCerrado && (
                  <div className="text-[10px] text-red-500 mt-1">⚠ Usuario ha cerrado el chat</div>
                )}
              </div>
            </div>

            {c.estado === "Activa" ? (
              <span className="etiqueta-animada text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-xl bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200">
                {c.estado}
              </span>
            ) : (
              <span
                className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-xl font-medium fade-in ${
                  c.estado === "Inactiva"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
                    : c.estado === "Cerrado"
                    ? "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {c.estado}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-around items-center border-t bg-white dark:bg-gray-900 dark:border-gray-700 py-4">
        {["todas", "gpt", "humanas"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-sm ${
              filtro === f
                ? "text-blue-600 font-semibold dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {f === "gpt" ? "GPT" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversacionList;
