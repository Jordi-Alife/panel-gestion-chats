import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ChatMovil() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const chatRef = useRef(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});

  const cargarMensajes = () => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const ordenados = (data || []).sort(
          (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
        );
        setMensajes(ordenados);
        setTimeout(() => {
          chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: "auto",
          });
        }, 100);
      })
      .catch(console.error);
  };

  useEffect(() => {
    cargarMensajes();
    const interval = setInterval(cargarMensajes, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-orange-500/80 backdrop-blur-sm text-white shadow-md" style={{ minHeight: "60px" }}>
        <div className="flex items-center gap-3">
          <div className="bg-gray-300 text-gray-700 font-bold w-10 h-10 rounded-full flex items-center justify-center text-sm">
            {userId?.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-sm leading-tight">
            <div className="font-medium text-white">ID: {userId}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/conversaciones")}
            className="text-white text-lg"
            title="Volver atrás"
          >
            ←
          </button>
          <button className="text-white text-lg" title="Ver detalles">
            ℹ️
          </button>
        </div>
      </div>

      {/* MENSAJES */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {mensajes.map((msg, index) => {
          const isAsistente = msg.from?.toLowerCase() === "asistente";
          const align = isAsistente ? "justify-start" : "justify-end";
          const bubbleColor = isAsistente
            ? "bg-white text-gray-900"
            : "bg-black text-white";
          return (
            <div key={index} className={`flex ${align}`}>
              <div
                className={`rounded-xl p-3 shadow max-w-[80%] ${bubbleColor}`}
              >
                <p className="text-[15px] whitespace-pre-wrap">{msg.message}</p>
                {msg.original && (
                  <div className="mt-1 text-[11px] text-right">
                    <button
                      onClick={() =>
                        setOriginalesVisibles((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      className={`underline text-xs ${
                        isAsistente ? "text-gray-500" : "text-white/70"
                      }`}
                    >
                      {originalesVisibles[index]
                        ? "Ocultar original"
                        : "Ver original"}
                    </button>
                    {originalesVisibles[index] && (
                      <p
                        className={`mt-1 italic text-left ${
                          isAsistente ? "text-gray-500" : "text-white/70"
                        }`}
                      >
                        {msg.original}
                      </p>
                    )}
                  </div>
                )}
                <div
                  className={`text-[10px] mt-1 opacity-60 text-right ${
                    isAsistente ? "text-gray-500" : "text-white"
                  }`}
                >
                  {new Date(msg.lastInteraction).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center gap-2 px-4 py-3 bg-white shadow-md border-t"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
      >
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          className="flex-1 border rounded-full px-4 py-2 text-[15px] focus:outline-none"
        />
        <button
          type="submit"
          className="bg-black text-white rounded-full px-4 py-2 text-[14px]"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
