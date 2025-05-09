import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPaperclip, FiSend } from "react-icons/fi";

const ChatMovil = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);
  const [textoEscribiendo, setTextoEscribiendo] = useState("");
  const chatRef = useRef(null);
  const scrollForzado = useRef(true);

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  const cargarMensajes = async () => {
    try {
      const res = await fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`);
      const data = await res.json();
      const ordenados = (data || []).sort(
        (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
      );
      setMensajes(ordenados);

      setTimeout(() => {
        if (scrollForzado.current && chatRef.current) {
          chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "auto" });
        }
      }, 100);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarMensajes();
    const interval = setInterval(cargarMensajes, 2000);
    return () => clearInterval(interval);
  }, [userId]);

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
    scrollForzado.current = cercaDelFinal;
  };

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <div className="flex items-center p-2 border-b">
        <button onClick={() => navigate("/conversaciones")} className="text-gray-600 text-xl">
          ←
        </button>
        <div className="flex-1 text-center font-semibold">ID: {userId}</div>
        <button onClick={() => alert("Ver detalles")} className="text-gray-600 text-xl">
          ℹ️
        </button>
      </div>

      {/* MENSAJES */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"
        onScroll={handleScroll}
      >
        {mensajes.map((msg, index) => {
          const isAsistente =
            msg.from?.toLowerCase() === "asistente" || msg.from?.toLowerCase() === "agente";

          const align = isAsistente ? "justify-end" : "justify-start";

          const shapeClass = msg.manual
            ? "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[4px] rounded-bl-[20px]" // manual azul
            : isAsistente
            ? "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[4px] rounded-bl-[20px]" // asistente negro
            : "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[20px] rounded-bl-[4px]"; // usuario blanco

          return (
            <div key={index} className={`flex ${align}`}>
              <div
                className={`message max-w-[80%] p-3 shadow ${shapeClass} ${
                  msg.manual
                    ? "bg-[#2563eb] text-white"
                    : isAsistente
                    ? "bg-black text-white"
                    : "bg-white text-gray-800 border"
                }`}
              >
                {msg.message.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                  <img
                    src={msg.message}
                    alt="Imagen"
                    className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain"
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                )}

                {msg.original && (
                  <div className="mt-2 text-[11px] text-right">
                    <button
                      onClick={() =>
                        setOriginalesVisibles((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      className={`underline text-xs ${
                        isAsistente || msg.manual ? "text-white/70" : "text-blue-600"
                      }`}
                    >
                      {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                    </button>
                    {originalesVisibles[index] && (
                      <p
                        className={`mt-1 italic text-left ${
                          isAsistente || msg.manual ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {msg.original}
                      </p>
                    )}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1 opacity-60 text-right ${
                    isAsistente || msg.manual ? "text-white" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.lastInteraction).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
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
          onClick={() =>
            chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" })
          }
          className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
        >
          ↓
        </button>
      )}

      {/* INPUT MODERNO */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
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
          cargarMensajes();
        }}
        className="flex items-center px-2 py-2 border-t bg-white"
      >
        <label className="cursor-pointer px-2">
          <FiPaperclip className="text-2xl text-gray-600" />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
            className="hidden"
          />
        </label>
        <input
          type="text"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="ml-2 bg-black text-white rounded-full p-2"
        >
          <FiSend className="text-xl" />
        </button>
      </form>
    </div>
  );
};

export default ChatMovil;
