import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const Detalle = () => {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then((data) => setMensajes(data))
      .catch((err) => console.error("Error:", err));
  }, [userId]);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <div className="mb-4">
        <Link to="/" className="text-blue-600 hover:underline text-sm">← Volver al panel</Link>
        <h2 className="text-2xl font-bold mt-2">Conversación con {userId}</h2>
      </div>

      <div className="space-y-3 bg-gray-50 p-4 rounded-md max-h-[70vh] overflow-auto">
        {mensajes.map((msg, idx) => {
          const isPanel = msg.origin === "panel" || msg.fromPanel === true;
          return (
            <div
              key={idx}
              className={`flex ${isPanel ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-xs text-sm shadow ${
                  isPanel
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="mb-1">{msg.message}</p>
                <p className="text-[11px] text-right opacity-70">
                  {new Date(msg.lastInteraction).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        {mensajes.length === 0 && (
          <p className="text-gray-400 text-center">No hay mensajes para este usuario.</p>
        )}
      </div>
    </div>
  );
};

export default Detalle;
