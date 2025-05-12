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
  onToggleDetalles
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Cabecera estilo móvil */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
            {userId?.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-gray-700">ID: {userId}</span>
        </div>
        <button
          onClick={onToggleDetalles}
          className="w-6 h-6 flex items-center justify-center"
          title="Mostrar/Ocultar detalles"
        >
          <img src={iconVer} alt="Detalles" className="w-full h-full opacity-60 hover:opacity-100 transition" />
        </button>
      </div>

      {/* Historial de mensajes */}
      <div
        ref={chatRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-white"
      >
        {mensajes.length === 0 && (
          <p className="text-sm text-gray-500 text-center">No hay mensajes para mostrar.</p>
        )}

        {mensajes.map((msg, index) => {
          if (!msg) return null;

          if (msg.tipo === "etiqueta") {
            return (
              <div key={`etiqueta-${index}`} className="flex justify-center">
                <span
                  className={`text-xs uppercase tracking-wide px-3 py-1 rounded-2xl font-semibold fade-in ${
                    msg.mensaje === "Intervenida"
                      ? "bg-blue-100 text-blue-600"
                      : msg.mensaje === "Traspasado a GPT"
                      ? "bg-blue-100 text-blue-600"
                      : msg.mensaje === "El usuario ha cerrado el chat"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.mensaje === "Traspasado a GPT"
                    ? "Traspasada a GPT"
                    : msg.mensaje} •{" "}
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            );
          }

          const isAsistente =
            msg.from?.toLowerCase() === "asistente" || msg.from?.toLowerCase() === "agente";
          const align = isAsistente ? "justify-end" : "justify-start";
          const shapeClass = msg.manual
            ? "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[4px] rounded-bl-[20px]"
            : isAsistente
            ? "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[4px] rounded-bl-[20px]"
            : "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[20px] rounded-bl-[4px]";
          const contenidoPrincipal = msg.manual ? msg.original : msg.message;
          const contenidoSecundario = msg.manual ? msg.message : msg.original;

          if (!contenidoPrincipal) return null;

          return (
            <div key={index} className={`flex ${align}`}>
              <div
                className={`max-w-[80%] p-3 shadow ${shapeClass} ${
                  msg.manual
                    ? "bg-[#2563eb] text-white"
                    : isAsistente
                    ? "bg-black text-white"
                    : "bg-[#f7f7f7] text-gray-800 border"
                }`}
              >
                {typeof contenidoPrincipal === "string" &&
                contenidoPrincipal.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                  <img
                    src={contenidoPrincipal}
                    alt="Imagen"
                    className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain"
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-[15px]">{contenidoPrincipal}</p>
                )}

                {contenidoSecundario && (
                  <div className="mt-2 text-[11px] text-right">
                    <button
                      onClick={() =>
                        setOriginalesVisibles((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      className={`underline text-xs ${
                        isAsistente || msg.manual ? "text-white/70" : "text-blue-600"
                      }`}
                    >
                      {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                    </button>
                    {originalesVisibles[index] && (
                      <p
                        className={`mt-1 italic text-left ${
                          isAsistente || msg.manual ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {contenidoSecundario}
                      </p>
                    )}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1 opacity-60 text-right ${
                    isAsistente || msg.manual ? "text-white" : "text-gray-500"
                  }`}
                >
                  {msg.lastInteraction
                    ? new Date(msg.lastInteraction).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            </div>
          );
        })}

        {textoEscribiendo && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-700 italic text-xs px-3 py-2 rounded-lg opacity-80 max-w-[60%]">
              {textoEscribiendo}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
