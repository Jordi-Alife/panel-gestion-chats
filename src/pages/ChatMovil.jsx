import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ChatMovil = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [usuario, setUsuario] = useState({});
  const chatRef = useRef(null);
  const ultimaLongitud = useRef(0); // ← para detectar nuevos mensajes
  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const ordenados = (data || []).sort(
          (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
        );
        setMensajes(ordenados);
        ultimaLongitud.current = ordenados.length;
      });

    fetch("https://web-production-51989.up.railway.app/api/conversaciones")
      .then((res) => res.json())
      .then((all) => {
        const info = all.find((c) => c.userId === userId);
        setUsuario(info || {});
      });

    const interval = setInterval(() => {
      fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          const ordenados = (data || []).sort(
            (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
          );
          if (ordenados.length > ultimaLongitud.current) {
            ultimaLongitud.current = ordenados.length;
            // solo hace scroll si hay nuevos mensajes
            if (chatRef.current) {
              chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
            }
          }
          setMensajes(ordenados);
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    // hace scroll al abrir la conversación
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="chat-container">
      {/* HEADER */}
      <div className="chat-header">
        <div className="avatar flex items-center justify-center bg-gray-300 text-sm text-gray-700">
          {usuario.iniciales || "--"}
        </div>
        <div className="flex flex-col">
          <div className="title">ID: {usuario.userId || userId}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate("/conversaciones")}
            className="text-gray-600 text-xl"
          >
            ←
          </button>
          <button
            onClick={() => alert("Ver detalles")}
            className="text-gray-600 text-xl"
          >
            ℹ️
          </button>
        </div>
      </div>

      {/* MENSAJES */}
      <div ref={chatRef} className="chat-messages">
        {mensajes.map((msg, index) => {
          const esPanel = msg.from?.toLowerCase() === "asistente" || msg.from?.toLowerCase() === "panel";
          const align = esPanel ? "flex-end" : "flex-start";
          const backgroundColor = esPanel ? "#FC6655" : "#FFFFFF";
          const colorTexto = esPanel ? "#FFFFFF" : "#000000";

          return (
            <div
              key={index}
              className="message"
              style={{
                alignSelf: align,
                backgroundColor,
                color: colorTexto,
              }}
            >
              {msg.message.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                <img
                  src={msg.message}
                  alt="Imagen"
                  className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain"
                />
              ) : (
                <p className="whitespace-pre-wrap text-base">{msg.message}</p>
              )}
              {msg.original && (
                <div className="mt-1 text-[11px] text-right">
                  <button
                    onClick={() =>
                      setOriginalesVisibles((prev) => ({
                        ...prev,
                        [index]: !prev[index],
                      }))
                    }
                    className={`underline text-xs ${
                      esPanel ? "text-white/80" : "text-black/70"
                    }`}
                  >
                    {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                  </button>
                  {originalesVisibles[index] && (
                    <p
                      className={`mt-1 italic text-left ${
                        esPanel ? "text-white/80" : "text-black/70"
                      }`}
                    >
                      {msg.original}
                    </p>
                  )}
                </div>
              )}
              <div
                className={`text-[10px] mt-1 opacity-60 text-right ${
                  esPanel ? "text-white" : "text-black"
                }`}
              >
                {new Date(msg.lastInteraction).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
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
};

export default ChatMovil;
