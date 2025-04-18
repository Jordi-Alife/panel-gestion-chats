import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

const Detalle = () => {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then((data) => setMensajes(data))
      .catch((err) => console.error("Error:", err));
  }, [userId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) return;
    setEnviando(true);

    await fetch("https://web-production-51989.up.railway.app/api/send-to-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message: respuesta }),
    });

    setMensajes((prev) => [
      ...prev,
      {
        userId,
        message: respuesta,
        lastInteraction: new Date().toISOString(),
        fromSlack: true,
      },
    ]);
    setRespuesta("");
    setEnviando(false);
  };

  return (
    <div className="p-6 flex flex-col h-[calc(100vh-4rem)]">
      <Link to="/" className="text-blue-600 underline mb-4">
        ← Volver al panel
      </Link>
      <h2 className="text-xl font-semibold mb-2">Conversación con {userId}</h2>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto border rounded-md bg-white p-4 space-y-4"
      >
        {mensajes.length === 0 && (
          <p className="text-gray-500">No hay mensajes para este usuario.</p>
        )}
        {mensajes.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[70%] px-4 py-2 rounded-lg shadow text-sm ${
              msg.fromSlack
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-gray-200 text-gray-900"
            }`}
          >
            <div>{msg.message}</div>
            <div className="text-[10px] opacity-70 mt-1 text-right">
              {new Date(msg.lastInteraction).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          placeholder="Escribe tu respuesta..."
          className="flex-1 border px-3 py-2 rounded-md text-sm"
        />
        <button
          onClick={enviarRespuesta}
          disabled={enviando}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Detalle;
