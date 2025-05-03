import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ChatMovil() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [agente, setAgente] = useState(null);
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
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center justify-between p-4 shadow">
        <button
          onClick={() => navigate("/conversaciones")}
          className="text-sm text-blue-600 underline"
        >
          Volver
        </button>
        <h2 className="text-md font-semibold">Chat con {userId}</h2>
        <div></div>
      </div>

      <div
        ref={chatRef}
        onScroll={() => {
          const el = chatRef.current;
          if (!el) return;
          const alFinal = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
          scrollForzado.current = alFinal;
        }}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {mensajes.map((msg, index) => {
          const isAsistente = msg.from?.toLowerCase() === "asistente";
          const bubbleColor = isAsistente
            ? "bg-[#ff5733] text-white"
            : "bg-gray-100 text-gray-800";
          const align = isAsistente ? "justify-end" : "justify-start";
          return (
            <div key={index} className={`flex ${align}`}>
              <div className={`rounded-xl max-w-[85%] p-3 shadow ${bubbleColor}`}>
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
                        isAsistente ? "text-white/70" : "text-blue-600"
                      } focus:outline-none`}
                    >
                      {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                    </button>
                    {originalesVisibles[index] && (
                      <p
                        className={`mt-1 italic text-left ${
                          isAsistente ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {msg.original}
                      </p>
                    )}
                  </div>
                )}
                <div
                  className={`text-[10px] mt-1 opacity-60 text-right ${
                    isAsistente ? "text-white" : "text-gray-500"
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
        className="border-t px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2"
      >
        <label className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 transition">
          Seleccionar archivo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
            className="hidden"
          />
        </label>
        {imagen && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <span>{imagen.name}</span>
            <button
              type="button"
              onClick={() => setImagen(null)}
              className="text-red-500 text-xs underline"
            >
              Quitar
            </button>
          </div>
        )}
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="w-full border rounded-full px-4 py-2 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#ff5733] text-white rounded-full px-4 py-2 text-sm hover:bg-orange-600"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
