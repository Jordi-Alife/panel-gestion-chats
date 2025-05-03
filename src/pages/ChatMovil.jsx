import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ChatMovil() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const chatRef = useRef(null);

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  const cargarMensajes = () => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const ordenados = (data || []).sort(
          (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
        );
        setMensajes(ordenados);
      })
      .catch(console.error);

    fetch("https://web-production-51989.up.railway.app/api/conversaciones")
      .then((res) => res.json())
      .then((convs) => {
        const info = convs.find((c) => c.userId === userId);
        setUsuarioSeleccionado(info || null);
      })
      .catch(console.error);
  };

  useEffect(() => {
    cargarMensajes();
    const interval = setInterval(cargarMensajes, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [mensajes]);

  return (
    <div className="flex flex-col h-screen bg-[#f0f4f8]">
      {/* Header estilo asistente */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-b from-white/80 to-white/30 shadow">
        <div className="flex items-center gap-2">
          {usuarioSeleccionado ? (
            <div className="bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
              {usuarioSeleccionado.userId.slice(0, 2).toUpperCase()}
            </div>
          ) : (
            <div className="bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-sm text-gray-700">--</div>
          )}
          <div className="text-xs">
            <div className="font-medium">
              ID: {usuarioSeleccionado ? usuarioSeleccionado.userId : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/conversaciones")}
            className="text-gray-600 text-xl"
          >
            ←
          </button>
          <button
            onClick={() => alert("Detalles próximamente")}
            className="text-gray-600 text-xl"
          >
            ℹ️
          </button>
        </div>
      </div>

      {/* Chat */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {mensajes.map((msg, index) => {
          const isAsistente = msg.from?.toLowerCase() === "asistente";
          const bubbleColor = isAsistente
            ? "bg-white text-gray-800"
            : "bg-black text-white";
          const align = isAsistente ? "justify-start" : "justify-end";
          return (
            <div key={index} className={`flex ${align}`}>
              <div className={`rounded-2xl px-4 py-2 max-w-[80%] shadow ${bubbleColor}`}>
                <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                {msg.original && (
                  <div className="mt-1 text-[10px] text-right">
                    <button
                      onClick={() =>
                        setOriginalesVisibles((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      className="underline text-[10px]"
                    >
                      {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                    </button>
                    {originalesVisibles[index] && (
                      <p className="italic text-[11px] mt-1">{msg.original}</p>
                    )}
                  </div>
                )}
                <div className="text-[10px] opacity-60 text-right mt-1">
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

      {/* Input */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!respuesta.trim() && !imagen) return;

          if (imagen) {
            const formData = new FormData();
            formData.append("file", imagen);
            formData.append("userId", userId);
            await fetch("https://web-production-51989.up.railway.app/api/upload", {
              method: "POST",
              body: formData,
            });
            setImagen(null);
          } else {
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
          }
        }}
        className="flex items-center gap-2 p-3 border-t bg-white"
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
          className="bg-black text-white rounded-full px-4 py-2 text-sm"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
