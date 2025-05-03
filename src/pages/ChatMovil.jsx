import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ChatMovil() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const chatRef = useRef(null);
  const scrollForzado = useRef(true);

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  const cargarMensajes = () => {
    if (!userId) return;
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const ordenados = (data || []).sort(
          (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
        );
        setMensajes(ordenados);
        setTimeout(() => {
          if (scrollForzado.current && chatRef.current) {
            chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "auto" });
          }
        }, 100);
      })
      .catch(console.error);
  };

  useEffect(() => {
    cargarMensajes();
    const interval = setInterval(cargarMensajes, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
      }
    }, 100);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetch("https://web-production-51989.up.railway.app/api/marcar-visto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    }
  }, [userId]);

  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const pasada = new Date(fecha);
    const diffMs = ahora - pasada;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffSec < 60) return `hace ${diffSec}s`;
    if (diffMin < 60) return `hace ${diffMin}m`;
    if (diffHrs < 24) return `hace ${diffHrs}h`;
    if (diffDays === 1) return "ayer";
    return `hace ${diffDays}d`;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="avatar"></div>
        <div>
          <div className="title">Soporte Canal Digital</div>
          <div className="subtitle">Funeraria Esperanza</div>
        </div>
        <button
          onClick={() => navigate("/conversaciones")}
          style={{ marginLeft: "auto", fontSize: "16px", background: "none", border: "none", cursor: "pointer" }}
        >
          ✕
        </button>
      </div>

      <div
        ref={chatRef}
        onScroll={() => {
          const el = chatRef.current;
          if (!el) return;
          const alFinal = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
          scrollForzado.current = alFinal;
        }}
        className="chat-messages"
      >
        {mensajes.map((msg, index) => {
          const isAsistente = msg.from?.toLowerCase() === "asistente";
          const tipoClase = isAsistente ? "assistant" : "user";
          return (
            <div key={index} className={`message ${tipoClase}`}>
              {msg.message.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                <img
                  src={msg.message}
                  alt="Imagen"
                  style={{ maxWidth: "100%", borderRadius: "8px" }}
                />
              ) : (
                <p>{msg.message}</p>
              )}
              {msg.original && (
                <div style={{ marginTop: "4px", fontSize: "11px", textAlign: "right" }}>
                  <button
                    onClick={() =>
                      setOriginalesVisibles((prev) => ({
                        ...prev,
                        [index]: !prev[index],
                      }))
                    }
                    style={{
                      textDecoration: "underline",
                      fontSize: "11px",
                      color: isAsistente ? "#888" : "#007bff",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                  </button>
                  {originalesVisibles[index] && (
                    <p style={{ marginTop: "2px", fontStyle: "italic", color: "#666" }}>
                      {msg.original}
                    </p>
                  )}
                </div>
              )}
              <div style={{ fontSize: "10px", opacity: 0.6, textAlign: "right", marginTop: "4px" }}>
                {new Date(msg.lastInteraction).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!userId) return;
          if (imagen) {
            const formData = new FormData();
            formData.append("file", imagen);
            formData.append("userId", userId);
            await fetch("https://web-production-51989.up.railway.app/api/upload", {
              method: "POST",
              body: formData,
            });
            setImagen(null);
            return;
          }
          if (!respuesta.trim()) return;
          await fetch("https://web-production-51989.up.railway.app/api/send-to-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              message: respuesta,
              agente: {
                nombre: perfil.nombre || "",
                foto: perfil.foto || "",
                uid: localStorage.getItem("id-usuario-panel") || null,
              },
            }),
          });
          setRespuesta("");
        }}
        className="chat-input"
      >
        <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "20px", cursor: "pointer" }}>➕</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
            style={{ display: "none" }}
          />
        </label>
        {imagen && (
          <div style={{ fontSize: "11px", color: "#555" }}>
            {imagen.name}
            <button
              type="button"
              onClick={() => setImagen(null)}
              style={{ color: "red", marginLeft: "4px", fontSize: "11px", textDecoration: "underline", background: "none", border: "none" }}
            >
              Quitar
            </button>
          </div>
        )}
        <input
          type="text"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
