import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

const Detalle = () => {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then(setMensajes)
      .catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) return;
    await fetch("https://web-production-51989.up.railway.app/api/send-to-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message: respuesta }),
    });
    setMensajes((prev) => [
      ...prev,
      { message: respuesta, lastInteraction: new Date().toISOString(), role: "assistant" },
    ]);
    setRespuesta("");
  };

  return (
    <div className="p-6">
      <Link to="/" className="text-blue-600 underline block mb-4">
        ← Volver al panel
      </Link>
      <h2 className="text-2xl font-semibold mb-4">Conversación con {userId}</h2>

      <div
        ref={chatRef}
        className="bg-white rounded-lg shadow p-4 h-96 overflow-y-auto mb-4"
      >
        {mensajes.length === 0 && (
          <p className="text-gray-500 text-center">No hay mensajes para este usuario.</p>
        )}
        {mensajes.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 flex ${
              msg.role === "assistant" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-xl px-4 py-2 shadow ${
                msg.role === "assistant"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p>{msg.message}</p>
              <p className="text-xs mt-1 opacity-60">
                {msg.role === "assistant" ? "Tú" : "Usuario"} |{" "}
                {new Date(msg.lastInteraction).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          placeholder="Escribe tu respuesta..."
          className="flex-grow border rounded px-3 py-2"
        />
        <button
          onClick={enviarRespuesta}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Detalle;
