import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import iconVer from '/src/assets/ver.svg';
import iconFile from '/src/assets/file.svg';

const ChatMovil = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);
  const [textoEscribiendo, setTextoEscribiendo] = useState("");
  const [animacionesActivas, setAnimacionesActivas] = useState(false);
  const [estado, setEstado] = useState("");
  const [intervenida, setIntervenida] = useState(false);
  const chatRef = useRef(null);
  const scrollForzado = useRef(true);

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  useEffect(() => {
    const est = localStorage.getItem(`estado-conversacion-${userId}`);
    const interv = localStorage.getItem(`intervenida-${userId}`);
    if (est) setEstado(est);
    if (interv) setIntervenida(interv === "true");
  }, [userId]);

  const cargarMensajes = async () => {
    try {
      const res = await fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`);
      const data = await res.json();
      const ordenados = (data || []).sort(
        (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
      );

      const etiquetaTexto = intervenida ? "Intervenida" : estado;
      const mostrarEtiqueta = estado === "Cerrado" || estado === "Activa" || estado === "Traspasado a GPT" || intervenida;

      let insertada = false;
      const mensajesConEtiqueta = [];

      for (let i = 0; i < ordenados.length; i++) {
        const msg = ordenados[i];

        if (
          mostrarEtiqueta &&
          !insertada &&
          intervenida &&
          msg.manual &&
          msg.from?.toLowerCase() === "asistente"
        ) {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: etiquetaTexto,
            timestamp: msg.lastInteraction,
          });
          insertada = true;
        }

        mensajesConEtiqueta.push(msg);
      }

      if (mostrarEtiqueta && !insertada && ordenados.length > 0) {
        mensajesConEtiqueta.unshift({
          tipo: "etiqueta",
          mensaje: etiquetaTexto,
          timestamp: ordenados[0].lastInteraction,
        });
      }

      setMensajes(mensajesConEtiqueta);

      setTimeout(() => {
        if (scrollForzado.current && chatRef.current) {
          chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "auto" });
        }
        setAnimacionesActivas(true);
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
      <div className="flex items-center justify-between p-3 border-b">
        <button onClick={() => navigate("/conversaciones-movil")} className="text-xl">←</button>
        <div className="flex items-center gap-2">
          <div className="bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center text-sm">
            {userId.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm font-semibold">ID: {userId}</span>
        </div>
        <button onClick={() => navigate(`/detalles/${userId}`)} className="w-6 h-6">
          <img src={iconVer} alt="Detalles" className="w-full h-full" />
        </button>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2" onScroll={handleScroll}>
        {mensajes.map((msg, index) => {
          if (msg.tipo === "etiqueta") {
            return (
              <div key={`etiqueta-${index}`} className="flex justify-center">
                <span className={`text-xs uppercase tracking-wide px-3 py-1 rounded-2xl font-semibold fade-in ${
                  msg.mensaje === "Activa"
                    ? "bg-green-100 text-green-700"
                    : msg.mensaje === "Cerrado"
                    ? "bg-red-100 text-red-600"
                    : msg.mensaje === "Intervenida"
                    ? "bg-blue-100 text-blue-600"
                    : msg.mensaje === "Traspasado a GPT"
                    ? "bg-gray-300 text-gray-700"
                    : "bg-gray-200 text-gray-800"
                }`}>
                  {msg.mensaje} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          }

          const isAsistente = msg.from?.toLowerCase() === "asistente" || msg.from?.toLowerCase() === "agente";
          const align = isAsistente ? "justify-end" : "justify-start";
          const shapeClass = msg.manual
            ? "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[4px] rounded-bl-[20px]"
            : isAsistente
            ? "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[4px] rounded-bl-[20px]"
            : "rounded-tl-[20px] rounded-tr-[20px] rounded-br-[20px] rounded-bl-[4px]";
          const contenidoPrincipal = msg.manual ? msg.original : msg.message;
          const contenidoSecundario = msg.manual ? msg.message : msg.original;

          return (
            <div key={index} className={`flex ${align} ${animacionesActivas ? "transition-all duration-300 ease-out" : "opacity-0"}`}>
              <div className={`max-w-[80%] p-3 shadow ${shapeClass} ${
                msg.manual
                  ? "bg-[#2563eb] text-white"
                  : isAsistente
                  ? "bg-black text-white"
                  : "bg-[#f7f7f7] text-gray-800 border"
              }`}>
                {contenidoPrincipal.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                  <img src={contenidoPrincipal} alt="Imagen" className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain" />
                ) : (
                  <p className="whitespace-pre-wrap text-[15px]">{contenidoPrincipal}</p>
                )}
                {contenidoSecundario && (
                  <div className="mt-2 text-[11px] text-right">
                    <button
                      onClick={() =>
                        setOriginalesVisibles((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      className={`underline text-xs ${isAsistente || msg.manual ? "text-white/70" : "text-blue-600"}`}
                    >
                      {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                    </button>
                    {originalesVisibles[index] && (
                      <p className={`mt-1 italic text-left ${isAsistente || msg.manual ? "text-white/70" : "text-gray-500"}`}>
                        {contenidoSecundario}
                      </p>
                    )}
                  </div>
                )}
                <div className={`text-[10px] mt-1 opacity-60 text-right ${isAsistente || msg.manual ? "text-white" : "text-gray-500"}`}>
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

      <div className="p-4 bg-white border-t">
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
          className="flex items-center gap-2"
        >
          <button type="button" onClick={() => alert("Adjuntar archivo")} className="w-6 h-6">
            <img src={iconFile} alt="Archivo" className="w-full h-full" />
          </button>
          <button type="button" onClick={() => alert("Hashtags")} className="text-xl">#</button>
          <input
            type="text"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Escribe un mensaje..."
            className={`flex-1 border rounded-full px-4 py-3 text-base focus:outline-none transition-all duration-200 ease-in-out ${
              respuesta.trim() ? "ring-2 ring-blue-400" : ""
            }`}
            style={{ fontSize: "16px" }}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatMovil;
