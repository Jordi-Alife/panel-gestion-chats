import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import iconVer from "/src/assets/ver.svg";
import iconFile from "/src/assets/file.svg";
import { escucharMensajesUsuario } from "../firebaseDB";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const oldestTimestampRef = useRef(null);

  const chatRef = useRef(null);
  const scrollForzado = useRef(true);
  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  useEffect(() => {
  const est = localStorage.getItem(`estado-conversacion-${userId}`);
  if (est) {
    setEstado(est);
  } else {
    // Forzar estado si no está disponible (archivadas por defecto)
    setEstado("cerrado");
  }
}, [userId]);
  useEffect(() => {
  if (!userId) return;

  // Esperar 50ms para asegurar que estado ya está definido
  const timeout = setTimeout(() => {
    cargarMensajes();
  }, 50);

  return () => clearTimeout(timeout);
}, [userId, estado]);

  useEffect(() => {
  if (!userId) return;

  fetch(`${BACKEND_URL}/api/conversaciones?tipo=archivo`)
    .then((res) => res.json())
    .then((lista) => {
      const encontrada = lista.find((c) => c.userId === userId);
      if (encontrada) {
        localStorage.setItem(`conversacion-${userId}`, JSON.stringify(encontrada));
      }
    })
    .catch(console.error);
}, [userId]);

  const cargarMensajes = async () => {
  if (!userId) return;

  const convData = localStorage.getItem(`conversacion-${userId}`);
  let conv = null;
  try {
    conv = JSON.parse(convData);
  } catch {}

  // ✅ Usa historial formateado si está
  if (
    conv?.historialFormateado &&
    ["archivado", "cerrado"].includes((estado || "").toLowerCase())
  ) {
    const lineas = conv.historialFormateado.split("\n");
    const mensajesHist = lineas.map((linea, i) => {
      const esUsuario = linea.startsWith("Usuario:");
      const esAsistente = linea.startsWith("Asistente:");
      const rol = esUsuario ? "usuario" : esAsistente ? "asistente" : "sistema";
      const contenido = linea.replace(/^Usuario:\s?|^Asistente:\s?/, "");

      return {
        id: `hist-${i}`,
        from: rol,
        tipo: "texto",
        message: contenido,
        mensaje: contenido,
        original: contenido,
        timestamp: new Date().toISOString(),
      };
    });

    setMensajes(mensajesHist);
    return;
  }

  // 🔁 Si no hay historial, usa fetch (opcional, fallback)
  try {
    const res = await fetch(`${BACKEND_URL}/api/conversaciones/${userId}`);
    const data = await res.json();

    const ordenados = (data || []).sort(
      (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
    );

    const mensajesConEtiqueta = [];
    let estadoActual = "gpt";

    for (let i = 0; i < ordenados.length; i++) {
      const msg = ordenados[i];
      const ultimaEtiqueta = mensajesConEtiqueta.length
        ? mensajesConEtiqueta[mensajesConEtiqueta.length - 1]
        : null;

      if (msg.tipo === "estado" && msg.estado === "Traspasado a GPT") {
        if (!ultimaEtiqueta || ultimaEtiqueta.mensaje !== "Traspasado a GPT") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Traspasado a GPT",
            timestamp: msg.lastInteraction,
          });
        }
        estadoActual = "gpt";
      }

      if (msg.tipo === "estado" && msg.estado === "Cerrado") {
        if (!ultimaEtiqueta || ultimaEtiqueta.mensaje !== "El usuario ha cerrado el chat") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "El usuario ha cerrado el chat",
            timestamp: msg.lastInteraction,
          });
        }
      }

      if (msg.manual === true && estadoActual === "gpt") {
        if (!ultimaEtiqueta || ultimaEtiqueta.mensaje !== "Intervenida") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Intervenida",
            timestamp: msg.lastInteraction,
          });
        }
        estadoActual = "humano";
      }

      mensajesConEtiqueta.push(msg);
    }

    setMensajes(mensajesConEtiqueta);
  } catch (err) {
    console.error("❌ Error cargando mensajes fallback:", err);
  }
};

  useEffect(() => {
  if (!userId || !estado) return;

  const tipo = (estado || "").toLowerCase();
  if (["cerrado", "archivado"].includes(tipo)) {
    cargarMensajes(); // ✅ usa historialFormateado si está disponible
    return;
  }

  const stop = escucharMensajesUsuario(userId, (docs) => {
    const ordenados = docs.sort(
      (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
    );

    const mensajesConEtiqueta = [];
    let estadoActual = "gpt";

    for (let i = 0; i < ordenados.length; i++) {
      const msg = ordenados[i];
      const ultimaEtiqueta = mensajesConEtiqueta.length
        ? mensajesConEtiqueta[mensajesConEtiqueta.length - 1]
        : null;

      if (msg.tipo === "estado" && msg.estado === "Traspasado a GPT") {
        if (!ultimaEtiqueta || ultimaEtiqueta.mensaje !== "Traspasado a GPT") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Traspasado a GPT",
            timestamp: msg.lastInteraction,
          });
        }
        estadoActual = "gpt";
      }

      if (msg.tipo === "estado" && msg.estado === "Cerrado") {
        if (
          !ultimaEtiqueta ||
          ultimaEtiqueta.mensaje !== "El usuario ha cerrado el chat"
        ) {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "El usuario ha cerrado el chat",
            timestamp: msg.lastInteraction,
          });
        }
      }

      if (msg.manual === true && estadoActual === "gpt") {
        if (!ultimaEtiqueta || ultimaEtiqueta.mensaje !== "Intervenida") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Intervenida",
            timestamp: msg.lastInteraction,
          });
        }
        estadoActual = "humano";
      }

      mensajesConEtiqueta.push(msg);
    }

    const mapa = new Map();
    mensajesConEtiqueta.forEach((m) => {
      const clave = m.id || `${m.timestamp}-${m.rol}-${m.tipo}-${m.message}`;
      mapa.set(clave, m);
    });

    let ordenadosFinal = Array.from(mapa.values()).sort(
      (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
    );

    const filtradoSinDuplicados = [];
    let ultimaEtiqueta = null;

    for (const msg of ordenadosFinal) {
      if (
        msg.tipo === "etiqueta" &&
        ultimaEtiqueta &&
        ultimaEtiqueta.tipo === "etiqueta" &&
        ultimaEtiqueta.mensaje === msg.mensaje &&
        Math.abs(new Date(ultimaEtiqueta.timestamp) - new Date(msg.timestamp)) < 3000
      ) {
        continue;
      }

      filtradoSinDuplicados.push(msg);
      if (msg.tipo === "etiqueta") ultimaEtiqueta = msg;
    }

    if (filtradoSinDuplicados.length > 50) {
      filtradoSinDuplicados.splice(
        0,
        filtradoSinDuplicados.length - 50
      );
    }

    setMensajes(filtradoSinDuplicados);

    requestAnimationFrame(() => {
      if (scrollForzado.current && chatRef.current) {
        chatRef.current.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "auto",
        });
      }
      setAnimacionesActivas(true);
    });
  });

  return () => stop();
}, [userId, estado]);

  useEffect(() => {
  if (!userId) return;

  const stop = window.escucharTextoEscribiendo(userId, (nuevoTexto) => {
    setTextoEscribiendo(nuevoTexto);
  });

  return () => {
    if (stop) stop();
  };
}, [userId]);

  const handleScroll = async () => {
    if (!chatRef.current) return;
    const el = chatRef.current;
    const { scrollTop, scrollHeight, clientHeight } = el;

    const cercaDelFinal = scrollTop + clientHeight >= scrollHeight - 100;
    setMostrarScrollBtn(!cercaDelFinal);
    scrollForzado.current = cercaDelFinal;

    if (scrollTop === 0 && hasMore && !loadingMore) {
      setLoadingMore(true);
      await cargarMensajes(oldestTimestampRef.current);
      setLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-3 border-b">
        <button
  onClick={() => {
    const vieneDeArchivadas = window.location.pathname.includes("archivadas-movil");
    navigate(vieneDeArchivadas ? "/archivadas-movil" : "/conversaciones-movil");
  }}
  className="text-xl"
>
  ←
</button>
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
        {mensajes.length === 0 && (
  <div className="text-center text-sm text-gray-500 mt-8">
    ⚠️ No hay mensajes que mostrar (mensajes.length = 0)
  </div>
)}
  {mensajes.map((msg, index) => {
    // 🔒 Evitar renderizar mensajes vacíos que no sean imagen ni etiqueta
    if (
  !msg.message &&
  !msg.mensaje &&
  !msg.original &&
  msg.tipo !== "imagen" &&
  msg.tipo !== "etiqueta"
) {
  return null;
}

    if (msg.tipo === "etiqueta") {
      return (
        <div key={`etiqueta-${index}`} className="flex justify-center">
          <span className={`text-xs uppercase tracking-wide px-3 py-1 rounded-2xl font-semibold fade-in ${
            msg.mensaje === "Intervenida"
              ? "bg-blue-100 text-blue-600"
              : msg.mensaje === "Traspasado a GPT"
              ? "bg-gray-200 text-gray-800"
              : "bg-red-100 text-red-600"
          }`}>
            {msg.mensaje === "Traspasado a GPT" ? "Traspasada a GPT" : msg.mensaje} •{" "}
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

          const contenidoPrincipal =
            msg.tipo === "imagen"
              ? msg.message
              : msg.manual
              ? msg.original
              : msg.message;

          const contenidoSecundario =
            msg.tipo === "imagen"
              ? null
              : msg.manual
              ? msg.message
              : msg.original;

          return (
            <div key={index} data-id={msg.id} className={`flex ${align} ${animacionesActivas ? "transition-all duration-300 ease-out" : "opacity-0"}`}>
              <div className={`max-w-[80%] p-3 ${shapeClass} ${
                msg.manual
                  ? "bg-[#2563eb] text-white"
                  : isAsistente
                  ? "bg-[#2f2f2f] text-white dark:bg-[#3a3a3a] border border-transparent"
                  : "bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-white"
              }`}>
                {msg.tipo === "imagen" ? (
                  <img
                    src={contenidoPrincipal}
                    alt="Imagen enviada"
                    className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain"
                  />
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

      {mostrarScrollBtn && (
        <button
          onClick={() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" })}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg scroll-button-animate"
        >
          ↓
        </button>
      )}

      <div className="p-4 bg-white border-t">
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            if (imagen) {
              const formData = new FormData();
              formData.append("file", imagen);
              formData.append("userId", userId);
              formData.append("agenteUid", localStorage.getItem("id-usuario-panel") || "");

              try {
                const res = await fetch("https://web-production-51989.up.railway.app/api/upload-agente", {
                  method: "POST",
                  body: formData,
                });

                const result = await res.json();
                if (!res.ok || !result.imageUrl) {
                  alert("Hubo un problema al subir la imagen.");
                } else {
                  setTimeout(() => cargarMensajes(), 300);
                  setTimeout(() => {
                    if (chatRef.current) {
                      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
                    }
                  }, 350);
                }
              } catch (err) {
                alert("Error al subir imagen.");
              }

              setImagen(null);
              return;
            }

            if (!respuesta.trim()) return;

            await fetch(`${BACKEND_URL}/api/send-to-user`, {
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

            setTimeout(() => cargarMensajes(), 300);
            setTimeout(() => {
              if (chatRef.current) {
                chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
              }
            }, 350);
          }}
          className="flex items-center gap-2"
        >
          <label className="w-6 h-6 cursor-pointer">
            <img src={iconFile} alt="Archivo" className="w-full h-full opacity-60 hover:opacity-100" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagen(e.target.files[0])}
              className="hidden"
            />
          </label>
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

        {imagen && (
          <div className="mt-3 flex items-center gap-3">
            <img
              src={URL.createObjectURL(imagen)}
              alt="Previsualización"
              className="max-h-[100px] rounded-lg border"
            />
            <button
              type="button"
              onClick={() => setImagen(null)}
              className="text-red-500 text-sm underline"
            >
              Quitar imagen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export default ChatMovil;
