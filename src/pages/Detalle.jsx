import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

const Detalle = () => {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then(setMensajes)
      .catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [mensajes]);

  const handleSend = async () => {
    if (!respuesta.trim()) return;

    const message = respuesta.trim();
    await fetch("https://web-production-51989.up.railway.app/api/send-to-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message }),
    });

    setMensajes((prev) => [
      ...prev,
      {
        userId,
        message,
        lastInteraction: new Date().toISOString(),
        role: "assistant",
      },
    ]);
    setRespuesta("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] px-6 py-4">
      <Link to="/" className="text-sm text-blue-600 mb-2">← Volver al panel</Link>
      <h2 className="text-xl font-semibold mb-4">Conversación con {userId}</h2>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-white rounded-lg p-4 space-y-4"
        style={{ maxHeight: "100%", minHeight: 0 }}
      >
        {mensajes.length === 0 ? (
          <p className="text-gray-500">No hay mensajes para este usuario.</p>
        ) : (
          mensajes.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "assistant" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-xl shadow text-sm ${
                  msg.role === "assistant"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <p className="text-[11px] mt-1 opacity-70">
                  {msg.role === "assistant" ? "Asistente" : "Usuario"} — {new Date(msg.lastInteraction).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 border-t pt-4">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Escribe tu respuesta..."
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Detalle;
