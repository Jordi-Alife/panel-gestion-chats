import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ChatMovil = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [usuario, setUsuario] = useState({});
  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);
  const [textoEscribiendo, setTextoEscribiendo] = useState("");
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
  }, [userId]);
    useEffect(() => {
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
      }
    }, 100);
  }, [mensajes]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`https://web-production-51989.up.railway.app/api/escribiendo/${userId}`)
        .then((res) => res.json())
        .then((data) => setTextoEscribiendo(data.texto || ""))
        .catch(console.error);
    }, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleScroll = () => {
    if (!chatRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    const cercaDelFinal = scrollTop + clientHeight >= scrollHeight - 100;
    setMostrarScrollBtn(!cercaDelFinal);
  };
    return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={() => navigate("/conversaciones")} className="text-gray-600 text-xl">
          ←
        </button>
        <div className="chat-header-center">
          <div className="avatar flex items-center justify-center bg-gray-300 text-sm text-gray-700">
            {usuario.iniciales || "--"}
          </div>
          <div className="title">ID: {usuario.userId || userId}</div>
        </div>
        <button onClick={() => alert("Ver detalles")} className="text-gray-600 text-xl">
          ℹ️
        </button>
      </div>
            <div ref={chatRef} className="chat-messages" onScroll={handleScroll}>
        {mensajes.map((msg, index) => {
          const isGPT = msg.from?.toLowerCase() === "asistente";
          const isHumano = msg.from?.toLowerCase() === "agente";
          const claseBurb = isGPT
            ? "bg-gray-300 text-black"
            : isHumano
            ? "bg-black text-white"
            : "bg-white text-black";

          return (
            <div key={index} className={`message ${claseBurb} rounded-lg p-3 mb-2 max-w-[85%]`}>
              {msg.message.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                <img
                  src={msg.message}
                  alt="Imagen"
                  className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain"
                />
              ) : (
                <p className="whitespace-pre-wrap text-base">{msg.message}</p>
              )}
                            <div className="mt-1 text-[11px] text-right">
                <button
                  onClick={() =>
                    setOriginalesVisibles((prev) => ({
                      ...prev,
                      [index]: !prev[index],
                    }))
                  }
                  className={`underline text-xs ${
                    isHumano ? "text-white" : "text-blue-600"
                  }`}
                >
                  {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                </button>
                {originalesVisibles[index] && (
                  <p
                    className={`mt-1 italic text-left ${
                      isHumano ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {msg.original || "No disponible"}
                  </p>
                )}
              </div>

              <div
                className={`text-[10px] mt-1 opacity-60 text-right ${
                  isHumano ? "text-white" : "text-gray-500"
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
                      {textoEscribiendo && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-700 italic text-xs px-3 py-2 rounded-lg opacity-80 max-w-[60%]">
              {textoEscribiendo}...
            </div>
          </div>
        )}
      </div>

      {mostrarScrollBtn && (
        <button
          onClick={() => {
            if (chatRef.current) {
              chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
            }
          }}
          className="fixed bottom-20 right-4 bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
        >
          ↓
        </button>
      )}

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
          await fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
            .then((res) => res.json())
            .then((data) => {
              const ordenados = (data || []).sort(
                (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
              );
              setMensajes(ordenados);
            });
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
