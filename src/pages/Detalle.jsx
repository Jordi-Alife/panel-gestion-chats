import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

const Detalle = () => {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then(res => res.json())
      .then(setMensajes)
      .catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  const handleSend = async () => {
    if (!respuesta.trim()) return;

    await fetch("https://web-production-51989.up.railway.app/api/send-to-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message: respuesta }),
    });

    setMensajes(prev => [
      ...prev,
      {
        userId,
        message: respuesta,
        role: "assistant",
        lastInteraction: new Date().toISOString(),
      }
    ]);
    setRespuesta("");
  };

  return (
    <div className="flex flex-col h-screen px-4 pb-4">
      <Link to="/" className="text-sm text-blue-600 mt-4 mb-2">← Volver al panel</Link>
      <h2 className="text-xl font-semibold mb-2">Conversación con {userId}</h2>

      <div className="flex flex-col flex-1 bg-white rounded-lg shadow-inner overflow-hidden border border-gray-200">
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {mensajes.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "assistant" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-xl shadow text-sm ${
                msg.role === "assistant" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}>
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <p className="text-[11px] mt-1 opacity-70">
                  {msg.role === "assistant" ? "Asistente" : "Usuario"} — {new Date(msg.lastInteraction).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 p-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Escribe tu respuesta..."
            className="flex-1 border rounded px-3 py-2 text-sm"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detalle;
