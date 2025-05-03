import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ChatMovil = () => {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const chatRef = useRef(null);
  const [primeraVez, setPrimeraVez] = useState(true);
  const [mostrarBoton, setMostrarBoton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setMensajes(data.mensajes || []);
      })
      .catch((err) => console.error("Error cargando mensajes", err));
  }, [userId]);

  // Auto scroll solo al cargar por primera vez
  useEffect(() => {
    if (primeraVez && chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
      setPrimeraVez(false);
    }
  }, [mensajes, primeraVez]);

  const handleScroll = () => {
    if (!chatRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = chatRef.current;
    const enElFinal = scrollTop + clientHeight >= scrollHeight - 20;
    setMostrarBoton(!enElFinal);
  };

  return (
    <div className="chat-container">
      {/* Barra superior translúcida */}
      <div
        className="chat-header"
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid #ddd",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div className="avatar bg-gray-300 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
          {userId?.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="title text-sm font-bold">ID: {userId}</div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => navigate("/conversaciones")}
            className="text-black"
            title="Volver atrás"
          >
            ←
          </button>
          <button className="text-black" title="Ver detalles">i</button>
        </div>
      </div>

      {/* Mensajes */}
      <div
        ref={chatRef}
        className="chat-messages"
        onScroll={handleScroll}
        style={{
          flex: 1,
          padding: "1rem",
          overflowY: "auto",
          background: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {mensajes.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.from?.toLowerCase() === "usuario" ? "user" : "assistant"}`}
            style={{
              alignSelf: msg.from?.toLowerCase() === "usuario" ? "flex-end" : "flex-start",
              background: msg.from?.toLowerCase() === "usuario" ? "#000" : "#fff",
              color: msg.from?.toLowerCase() === "usuario" ? "#fff" : "#000",
              border: msg.from?.toLowerCase() === "usuario" ? "none" : "1px solid #ddd",
              borderRadius: "16px",
              padding: "0.75rem 1rem",
              maxWidth: "75%",
              fontSize: "15px", // aumentamos tamaño texto
            }}
          >
            {msg.texto}
            {msg.original && (
              <div>
                <a
                  href="#"
                  className="text-xs underline"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(msg.original);
                  }}
                >
                  Ver original
                </a>
                <div className="text-xs text-gray-500">{msg.timestamp}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botón flotante para volver abajo */}
      {mostrarBoton && (
        <button
          onClick={() =>
            chatRef.current.scrollTo({
              top: chatRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
          className="fixed bottom-24 right-4 bg-black text-white rounded-full p-3 shadow-lg"
        >
          ↓
        </button>
      )}

      {/* Input */}
      <div
        className="chat-input"
        style={{
          background: "#fff",
          borderTop: "1px solid #ddd",
          padding: "0.75rem",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm"
        />
        <button className="bg-black text-white rounded-full px-4 py-2 text-sm">Enviar</button>
      </div>
    </div>
  );
};

export default ChatMovil;
