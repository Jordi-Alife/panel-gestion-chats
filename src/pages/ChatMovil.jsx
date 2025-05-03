import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ChatMovil = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [mostrarBoton, setMostrarBoton] = useState(false);
  const chatRef = useRef(null);
  const [haHechoScrollInicial, setHaHechoScrollInicial] = useState(false);

  // Cargar mensajes
  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setMensajes(data.mensajes || []);
      })
      .catch((err) => console.error("Error cargando mensajes", err));
  }, [userId]);

  // Scroll inicial solo la primera vez
  useEffect(() => {
    if (mensajes.length > 0 && chatRef.current && !haHechoScrollInicial) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "auto",
      });
      setHaHechoScrollInicial(true);
    }
  }, [mensajes, haHechoScrollInicial]);

  const handleScroll = () => {
    if (!chatRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = chatRef.current;
    const enElFinal = scrollTop + clientHeight >= scrollHeight - 20;
    setMostrarBoton(!enElFinal);
  };

  const scrollAbajo = () => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="chat-container">
      {/* CABECERA TRANSLÚCIDA */}
      <div
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #ddd",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            background: "#ccc",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {userId?.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "bold" }}>ID: {userId}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigate("/conversaciones")}
            style={{ fontSize: "18px", color: "#000" }}
            title="Volver"
          >
            ←
          </button>
          <button style={{ fontSize: "18px", color: "#000" }} title="Detalles">
            i
          </button>
        </div>
      </div>

      {/* MENSAJES */}
      <div
        ref={chatRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          background: "#f5f5f5",
          height: "calc(100vh - 140px)",
        }}
      >
        {mensajes.length === 0 ? (
          <div style={{ textAlign: "center", color: "#999" }}>Cargando conversación...</div>
        ) : (
          mensajes.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.from?.toLowerCase() === "usuario" ? "flex-end" : "flex-start",
                background: msg.from?.toLowerCase() === "usuario" ? "#000" : "#fff",
                color: msg.from?.toLowerCase() === "usuario" ? "#fff" : "#000",
                border: msg.from?.toLowerCase() === "usuario" ? "none" : "1px solid #ddd",
                borderRadius: "16px",
                padding: "0.75rem 1rem",
                maxWidth: "75%",
                fontSize: "15px",
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
                  <div style={{ fontSize: "12px", color: "#888" }}>{msg.timestamp}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* BOTÓN FLOTANTE */}
      {mostrarBoton && (
        <button
          onClick={scrollAbajo}
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            background: "#000",
            color: "#fff",
            borderRadius: "999px",
            padding: "0.75rem",
            fontSize: "20px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          ↓
        </button>
      )}

      {/* INPUT */}
      <div
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
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "999px",
            padding: "0.5rem 1rem",
            fontSize: "14px",
          }}
        />
        <button
          style={{
            background: "#000",
            color: "#fff",
            borderRadius: "999px",
            padding: "0.5rem 1rem",
            fontSize: "14px",
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatMovil;
