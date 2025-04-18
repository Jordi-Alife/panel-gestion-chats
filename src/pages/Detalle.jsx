import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const Detalle = () => {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then(res => res.json())
      .then(data => setMensajes(data))
      .catch(err => console.error("Error:", err));
  }, [userId]);

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) return;

    setEnviando(true);
    try {
      await fetch("https://web-production-51989.up.railway.app/api/send-to-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: respuesta })
      });

      setMensajes(prev => [
        ...prev,
        {
          userId,
          message: respuesta,
          lastInteraction: new Date().toISOString()
        }
      ]);
      setRespuesta("");
    } catch (error) {
      console.error("Error al enviar:", error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/" className="text-blue-600 underline mb-4 inline-block">← Volver al panel</Link>
      <h2 className="text-2xl font-bold mb-4">Conversación con {userId}</h2>

      <div className="space-y-4 mb-6">
        {mensajes.length > 0 ? mensajes.map((msg, idx) => (
          <div key={idx} className="border rounded p-3 bg-white shadow">
            <p className="text-sm text-gray-500">{new Date(msg.lastInteraction).toLocaleString()}</p>
            <p className="text-gray-800">{msg.message}</p>
          </div>
        )) : (
          <p className="text-gray-500 bg-white p-4 rounded border">No hay mensajes para este usuario.</p>
        )}
      </div>

      <div className="bg-white rounded shadow p-4 mt-4">
        <h3 className="text-lg font-semibold mb-2">Responder</h3>
        <textarea
          value={respuesta}
          onChange={e => setRespuesta(e.target.value)}
          rows={3}
          placeholder="Escribe tu respuesta aquí..."
          className="w-full p-2 border rounded mb-3 resize-none"
        />
        <button
          onClick={enviarRespuesta}
          disabled={enviando}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {enviando ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
};

export default Detalle;
