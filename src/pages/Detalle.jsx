import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";

const Detalle = () => {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then(res => res.json())
      .then(data => setMensajes(data))
      .catch(err => console.error("Error:", err));
  }, [userId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  const enviarRespuesta = async () => {
    if (!nuevoMensaje.trim()) return;
    setEnviando(true);
    try {
      await fetch("https://web-production-51989.up.railway.app/api/send-to-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: nuevoMensaje })
      });

      setMensajes(prev => [
        ...prev,
        {
          message: nuevoMensaje,
          lastInteraction: new Date().toISOString(),
          role: "system"
        }
      ]);
      setNuevoMensaje("");
    } catch (error) {
      console.error("Error enviando:", error);
    }
    setEnviando(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/" className="text-blue-600 underline mb-4 block">← Volver al panel</Link>
      <h2 className="text-2xl font-bold mb-4">Conversación con <span className="text-gray-700">{userId}</span></h2>

      <div className="bg-white border rounded-lg shadow flex flex-col h-[500px]">
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {mensajes.length === 0 && (
            <p className="text-gray-400 text-center">No hay mensajes para este usuario.</p>
          )}
          {mensajes.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[75%] px-4 py-2 rounded-lg text-sm shadow ${
                msg.role === "system"
                  ? "bg-blue-100 self-start"
                  : "bg-green-100 self-end ml-auto"
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">{new Date(msg.lastInteraction).toLocaleString()}</p>
              <p className="text-gray-800">{msg.message}</p>
            </div>
          ))}
        </div>

        <div className="p-3 border-t flex items-center space-x-2">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe tu respuesta..."
            className="flex-1 px-3 py-2 border rounded focus:outline-none"
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
    </div>
  );
};

export default Detalle;
