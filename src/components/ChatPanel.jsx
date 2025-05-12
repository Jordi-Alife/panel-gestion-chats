import React from "react";

const ChatPanel = ({
  mensajes,
  textoEscribiendo,
  originalesVisibles,
  setOriginalesVisibles,
  chatRef,
  onScroll,
}) => {
  return (
    <div
      ref={chatRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto p-6 space-y-4"
    >
      {mensajes.length === 0 && (
        <p className="text-sm text-gray-500 text-center">No hay mensajes para mostrar.</p>
      )}

      {mensajes.map((msg, index) => {
        if (msg.tipo === "etiqueta") {
          return (
            <div key={`etiqueta-${index}`} className="flex justify-center">
              <span className={`text-xs uppercase tracking-wide px-3 py-1 rounded-2xl font-semibold fade-in ${
                msg.mensaje === "Intervenida" || msg.mensaje === "Traspasado a GPT"
                  ? "bg-blue-100 text-blue-600"
                  : msg.mensaje === "Cerrado"
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-200 text-gray-800"
              }`}>
                {msg.mensaje === "Traspasado a GPT" ? "Traspasada a GPT" : msg.mensaje} •{" "}
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        }

        const isAsistente = msg.from?.toLowerCase() === "asistente" || msg.from?.toLowerCase() === "agente";
        const align = isAsistente ? "justify-end" : "justify-start";
        const shapeClass = msg.manual
          ? "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[4px] rounded-bl-[20px]"
          : isAsistente
          ? "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[4px] rounded-bl-[20px]"
          : "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[20px] rounded-bl-[4px]";
        const contenidoPrincipal = msg.manual ? msg.original : msg.message;
        const contenidoSecundario = msg.manual ? msg.message : msg.original;

        return (
          <div key={index} className={`flex ${align}`}>
            <div className={`max-w-[80%] p-3 shadow ${shapeClass} ${
              msg.manual
                ? "bg-[#2563eb] text-white"
                : isAsistente
                ? "bg-black text-white"
                : "bg-[#f7f7f7] text-gray-800 border"
            }`}>
              {contenidoPrincipal.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
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
          <div className="bg-gray-200 text-gray-700 italic text-xs px-3 py-2 rounded-lg opacity-80 max-w-[60%]">
            {textoEscribiendo}...
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
