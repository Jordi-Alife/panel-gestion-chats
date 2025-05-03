import { useEffect, useRef, useState } from "react";

export default function ChatMovil({ userId }) {
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

  return (
    <div className="md:hidden flex flex-col w-screen h-screen bg-[#f0f4f8]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-bold">💬</span>
          </div>
          <div>
            <div className="text-sm font-semibold">Soporte Canal Digital</div>
            <div className="text-xs text-gray-500">Funeraria Esperanza</div>
          </div>
        </div>
        <button className="text-gray-500 text-xl">×</button>
      </div>

      {/* Chat */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        onScroll={() => {
          const el = chatRef.current;
          if (!el) return;
          const alFinal = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
          scrollForzado.current = alFinal;
        }}
      >
        {mensajes.map((msg, index) => {
          const isAsistente = msg.from?.toLowerCase() === "asistente";
          const bubbleColor = isAsistente
            ? "bg-[#ff5733] text-white"
            : "bg-white text-gray-800 border";
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

      {/* Input */}
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
        className="border-t bg-white px-4 py-3 flex items-center gap-2 flex-shrink-0"
      >
        <label className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 transition">
          📎
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
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="bg-[#ff5733] text-white rounded-full px-4 py-2 text-sm hover:bg-orange-600"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
