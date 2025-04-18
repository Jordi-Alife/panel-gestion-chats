import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const Detalle = () => {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then(res => res.json())
      .then(data => setMensajes(data))
      .catch(err => console.error("Error:", err));
  }, [userId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Conversación con {userId}</h2>
      <Link to="/" className="text-blue-600 underline">Volver al panel</Link>
      <div className="mt-4 space-y-4">
        {mensajes.map((msg, idx) => (
          <div key={idx} className="border rounded p-3 bg-white shadow">
            <p className="text-sm text-gray-500">{new Date(msg.lastInteraction).toLocaleString()}</p>
            <p className="text-gray-800">{msg.message}</p>
          </div>
        ))}
        {mensajes.length === 0 && <p>No hay mensajes para este usuario.</p>}
      </div>
    </div>
  );
};

export default Detalle;
