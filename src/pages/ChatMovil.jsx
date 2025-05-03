import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ChatMovil() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId") || null;
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const chatRef = useRef(null);

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
          if (chatRef.current) {
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
    if (userId) {
      fetch("https://web-production-51989.up.railway.app/api/marcar-visto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    }
  }, [userId]);
    const iniciales = userId ? userId.slice(0, 2).toUpperCase() : "--";

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      {/* HEADER estilo asistente */}
      <div className="relative z-10 bg-gradient-to-b from-white/80 to-white/20 backdrop-blur-lg shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {usuarioSeleccionado?.foto ? (
            <img
              src={usuarioSeleccionado.foto}
              alt="Usuario"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700">
              {iniciales}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-800">{userId}</span>
            <span className="text-xs text-gray-500">ID: {userId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/conversaciones")}
            className="text-gray-600 hover:text-gray-900"
            title="Volver"
          >
            ←
          </button>
          <button
            onClick={() => alert("Ver detalles (placeholder)")}
            className="text-gray-600 hover:text-gray-900"
            title="Detalles"
          >
            ℹ️
          </button>
        </div>
      </div>
            {/* MENSAJES */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {mensajes.map((msg, index) => {
          const isAsistente = msg.from?.toLowerCase() === "asistente";
          return (
            <div key={index} className={`flex ${isAsistente ? "justify-start" : "justify-end"}`}>
              <div
                className={`rounded-xl max-w-[85%] p-3 shadow ${
                  isAsistente
                    ? "bg-white text-gray-800"
                    : "bg-black text-white"
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
                  <div className="mt-1 text-[11px]">
                    <button
                      onClick={() =>
                        setOriginalesVisibles((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      className={`underline text-xs ${
                        isAsistente ? "text-gray-500" : "text-white/70"
                      }`}
                    >
                      {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                    </button>
                    {originalesVisibles[index] && (
                      <p
                        className={`mt-1 italic ${
                          isAsistente ? "text-gray-500" : "text-white/70"
                        }`}
                      >
                        {msg.original}
                      </p>
                    )}
                  </div>
                )}
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
        className="flex items-center gap-2 px-4 py-3 border-t bg-white"
      >
        <input
          type="text"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="bg-black text-white rounded-full px-4 py-2 text-sm hover:bg-gray-800"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
