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

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  useEffect(() => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const ordenados = (data || []).sort(
          (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
        );
        setMensajes(ordenados);
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
          setMensajes(ordenados);
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
      }
    }, 100);
  }, [mensajes]);

  return (
    <div className="chat-container">
      {/* HEADER */}
      <div className="chat-header relative flex items-center justify-center">
        <button
          onClick={() => navigate("/conversaciones")}
          className="absolute left-4 text-gray-600 text-xl"
        >
          ←
        </button>
        <div className="flex flex-col items-center justify-center">
          <div className="avatar flex items-center justify-center bg-gray-300 text-sm text-gray-700">
            {usuario.iniciales || "--"}
          </div>
          <div className="title">ID: {usuario.userId || userId}</div>
        </div>
      </div>

      {/* MENSAJES */}
      <div ref={chatRef} className="chat-messages">
        {mensajes.map((msg, index) => {
          const isAsistente = msg.from?.toLowerCase() === "asistente";
          return (
            <div
              key={index}
              className={`message ${isAsistente ? "user" : "assistant"}`}
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
                      isAsistente ? "text-black/70" : "text-blue-600"
                    }`}
                  >
                    {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                  </button>
                  {originalesVisibles[index] && (
                    <p
                      className={`mt-1 italic text-left ${
                        isAsistente ? "text-black/70" : "text-gray-500"
                      }`}
                    >
                      {msg.original}
                    </p>
                  )}
                </div>
              )}
              <div
                className={`text-[10px] mt-1 opacity-60 text-right ${
                  isAsistente ? "text-black" : "text-gray-500"
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
