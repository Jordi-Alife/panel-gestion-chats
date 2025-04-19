// src/pages/Detalle.jsx

import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Detalle() {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const ordenados = data
          .sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction))
          .map((msg) => ({
            ...msg,
            from: msg.from || (msg.message.startsWith("¡") || msg.message.startsWith("Per ") ? "asistente" : "usuario"),
          }));
        setMensajes(ordenados);
      })
      .catch((err) => {
        console.error("Error cargando mensajes:", err);
      });
  }, [userId]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [mensajes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!respuesta.trim() || !userId) return;

    const nuevoMensaje = {
      userId,
      message: respuesta,
      lastInteraction: new Date().toISOString(),
      from: "asistente",
    };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setRespuesta("");

    await fetch("https://web-production-51989.up.railway.app/api/send-to-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message: respuesta }),
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-64px)]">
      <div className="bg-blue-900 text-white px-4 py-3 shadow-sm flex items-center justify-between">
        <Link to="/" className="text-sm text-white font-medium hover:underline">
          ← Volver
        </Link>
        <h2 className="text-md font-semibold truncate">Conversación con {userId}</h2>
        <div className="w-10" />
      </div>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 py-6 bg-gray-100 space-y-4"
      >
        {mensajes.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No hay mensajes todavía.</p>
        ) : (
          mensajes.map((msg, i) => {
            const isAsistente = msg.from === "asistente";
            return (
              <div
                key={i}
                className={`flex ${isAsistente ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg shadow text-sm whitespace-pre-wrap ${
                    isAsistente
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.message}
                  <div className="text-[10px] text-right mt-1 opacity-70">
                    {isAsistente ? "Asistente" : "Usuario"} —{" "}
                    {new Date(msg.lastInteraction).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t bg-white px-4 py-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
          placeholder="Escribe tu respuesta..."
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-full"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
