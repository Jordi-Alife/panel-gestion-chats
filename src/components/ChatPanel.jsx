import React from "react";
import iconVer from "/src/assets/ver.svg";

const ChatPanel = ({
  mensajes,
  textoEscribiendo,
  originalesVisibles,
  setOriginalesVisibles,
  chatRef,
  onScroll,
  userId,
  onToggleDetalles,
  onCargarMas,
  hayMas,
}) => {
  return (
    <div className="flex-1 bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-100">
          <div className="bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-sm">
            {userId?.slice(0, 2).toUpperCase()}
          </div>
          <span>ID: {userId}</span>
        </div>
        <button onClick={onToggleDetalles} className="text-gray-500 hover:text-black dark:text-gray-300 dark:hover:text-white w-6 h-6">
          <img src={iconVer} alt="Ver detalles" className="w-full h-full" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2" ref={chatRef} onScroll={onScroll}>
        {hayMas && (
          <div className="flex justify-center mb-2">
            <button
              onClick={onCargarMas}
              className="text-xs text-blue-600 dark:text-blue-400 underline hover:opacity-80 transition"
            >
              Ver mensajes anteriores
            </button>
          </div>
        )}

        {mensajes.map((msg, index) => {
  if (
  !msg.message &&
  !msg.original &&
  msg.tipo !== "imagen" &&
  msg.tipo !== "etiqueta" &&
  msg.tipo !== "estado" // ✅ permitir estado
) {
  return null;
}

if (msg.tipo === "etiqueta" || msg.tipo === "estado") {
  const textoEtiqueta = msg.mensaje || msg.estado;

  return (
    <div key={`etiqueta-${index}`} className="flex justify-center">
      <span
        className={`text-xs uppercase tracking-wide px-3 py-1 rounded-2xl font-semibold fade-in ${
          textoEtiqueta === "Intervenida"
            ? "bg-blue-100 text-blue-600 border border-transparent dark:border-white"
            : textoEtiqueta === "Traspasado a GPT"
            ? "bg-gray-200 text-gray-800"
            : "bg-red-100 text-red-600"
        }`}
      >
        {textoEtiqueta === "Traspasado a GPT" ? "Traspasada a GPT" : textoEtiqueta} •{" "}
        {new Date(msg.timestamp?.toDate?.() || msg.timestamp || msg.lastInteraction).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}

          const isAsistente =
            msg.from?.toLowerCase() === "asistente" ||
            msg.from?.toLowerCase() === "agente";
          const align = isAsistente ? "justify-end" : "justify-start";
          const shapeClass = msg.manual
            ? "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[4px] rounded-bl-[20px]"
            : isAsistente
            ? "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[4px] rounded-bl-[20px]"
            : "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[20px] rounded-bl-[4px]";

          const contenidoPrincipal =
            msg.tipo === "imagen"
              ? msg.message
              : msg.manual
              ? msg.original
              : msg.message;

          const contenidoSecundario =
            msg.tipo === "imagen"
              ? null
              : msg.manual
              ? msg.message
              : msg.original;

          return (
            <div key={index} data-id={msg.id} className={`flex ${align}`}>
              <div className={`max-w-[70%] p-3 ${shapeClass} ${
                msg.manual
                  ? "bg-[#2563eb] text-white"
                  : isAsistente
                  ? "bg-[#2f2f2f] text-white border border-transparent dark:bg-[#3a3a3a] dark:text-white"
                  : "bg-[#eaeaea] text-gray-900 dark:bg-gray-700 dark:text-white"
              }`}>
                {msg.tipo === "imagen" ? (
                  <img
                    src={contenidoPrincipal}
                    alt="Imagen enviada"
                    className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain"
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-[15px]">{contenidoPrincipal}</p>
                )}

                {contenidoSecundario && msg.tipo !== "imagen" && (
                  <div className="mt-2 text-[11px] text-right">
                    <button
                      onClick={() =>
                        setOriginalesVisibles((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      className={`underline text-xs ${isAsistente || msg.manual ? "text-white/70" : "text-blue-600"}`}
                    >
                      {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                    </button>
                    {originalesVisibles[index] && (
                      <p className={`mt-1 italic text-left ${isAsistente || msg.manual ? "text-white/70" : "text-gray-500"}`}>
                        {contenidoSecundario}
                      </p>
                    )}
                  </div>
                )}

                <div className={`text-[10px] mt-1 opacity-60 text-right ${isAsistente || msg.manual ? "text-white" : "text-gray-500"}`}>
                  {new Date(msg.lastInteraction).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {textoEscribiendo && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-700 italic text-xs px-3 py-2 rounded-lg opacity-80 max-w-[60%] dark:bg-gray-600 dark:text-white">
              {textoEscribiendo}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
