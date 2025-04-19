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
      .then((data) => {
        const ordenados = data.sort(
          (a, b) => new Date(a.lastInteraction || 0) - new Date(b.lastInteraction || 0)
        );
        setMensajes(ordenados);
      });
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
      {
        message: respuesta,
        sender: "admin",
        lastInteraction: new Date().toISOString(),
      },
    ]);
    setRespuesta("");
  };

  const getEstilo = (sender) => {
    switch (sender) {
      case "user":
        return "bg-gray-200 text-gray-900 self-start";
      case "assistant":
        return "bg-blue-500 text-white self-end";
      case "admin":
        return "bg-green-500 text-white self-end";
      default:
        return "bg-white text-gray-800";
    }
  };

  const getNombreRemitente = (sender) => {
    switch (sender) {
      case "user":
        return "Usuario";
      case "assistant":
        return "Asistente";
      case "admin":
        return "Tú";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 flex-shrink-0">
        <Link to="/" className="text-blue-600 underline mb-4 block">
          ← Volver al panel
        </Link>
        <h2 className="text-2xl font-semibold">Conversación con {userId}</h2>
      </div>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto bg-gray-100 px-6 py-4 flex flex-col space-y-3"
      >
        {mensajes.length === 0 ? (
          <p className="text-gray-500 text-center">No hay mensajes aún.</p>
        ) : (
          mensajes.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-xs px-4 py-2 rounded-xl shadow ${getEstilo(
                msg.sender
              )}`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
              <p className="text-[10px] opacity-60 mt-1">
                {getNombreRemitente(msg.sender)} —{" "}
                {msg.lastInteraction
                  ? new Date(msg.lastInteraction).toLocaleString()
                  : "Sin hora"}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-4 flex items-center gap-2">
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
