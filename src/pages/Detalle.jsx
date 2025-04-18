import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";

const Detalle = () => {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/" className="text-blue-600 underline mb-4 block">← Volver al panel</Link>
      <h2 className="text-2xl font-bold mb-4">Conversación con <span className="text-gray-700">{userId}</span></h2>

      <div
        ref={chatRef}
        className="bg-white border rounded-lg shadow p-4 h-[400px] overflow-y-auto space-y-4"
      >
        {mensajes.length === 0 && (
          <p className="text-gray-400 text-center">No hay mensajes para este usuario.</p>
        )}
        {mensajes.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[70%] px-4 py-2 rounded-lg text-sm shadow ${
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
    </div>
  );
};

export default Detalle;
