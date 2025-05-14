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
    <div className="bg-white w-full h-full rounded-lg shadow-md flex flex-col overflow-hidden">
      {/* Buscador arriba */}
      <div className="px-4 py-3 border-b">
        <input
          type="text"
          placeholder="Buscar conversaciones..."
          className="w-full border rounded-full px-4 py-2 text-sm focus:outline-none transition-all duration-200 ease-in-out"
          style={{ fontSize: "14px" }}
          onChange={(e) => {
            // Si ya tienes lógica de búsqueda, usa el estado correspondiente
            // Este es un placeholder visual por ahora
            console.log("Buscar:", e.target.value);
          }}
        />
      </div>

      {/* Lista de conversaciones scrollable */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
        {conversaciones.map((c) => (
          <div
            key={c.userId}
            onClick={() => onSelect(c.userId)}
            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition ${
              c.userId === userIdActual ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3 relative">
              <div className="relative">
                <div className="bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
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
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  {formatearTiempo(c.lastInteraction)}
                </div>
                {c.chatCerrado && (
                  <div className="text-[10px] text-red-500 mt-1">⚠ Usuario ha cerrado el chat</div>
                )}
              </div>
            </div>

            {c.estado === "Activa" ? (
              <span className="etiqueta-animada text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-xl bg-green-100 text-green-700">
                {c.estado}
              </span>
            ) : (
              <span
                className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-xl font-medium fade-in ${
                  c.estado === "Inactiva"
                    ? "bg-yellow-100 text-yellow-700"
                    : c.estado === "Cerrado"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {c.estado}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Botones abajo */}
      <div className="flex justify-around items-center border-t bg-white py-4">
        {["todas", "gpt", "humanas"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-sm ${
              filtro === f ? "text-blue-600 font-semibold" : "text-gray-600"
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
