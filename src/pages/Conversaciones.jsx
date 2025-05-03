import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Conversaciones() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get("userId") || null;
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [todasConversaciones, setTodasConversaciones] = useState([]);
  const [vistas, setVistas] = useState({});
  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);
  const [filtro, setFiltro] = useState("todas");
  const [agente, setAgente] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [vistaMovil, setVistaMovil] = useState("lista"); // NUEVO
  const chatRef = useRef(null);
  const scrollForzado = useRef(true);

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  const cargarDatos = () => {
    fetch("https://web-production-51989.up.railway.app/api/conversaciones")
      .then((res) => res.json())
      .then(setTodasConversaciones)
      .catch(console.error);

    fetch("https://web-production-51989.up.railway.app/api/vistas")
      .then((res) => res.json())
      .then(setVistas)
      .catch(console.error);
  };

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarMensajes = () => {
    if (!userId) return;
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const ordenados = (data || []).sort(
          (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
        );
        setMensajes(ordenados);
        const info = todasConversaciones.find((c) => c.userId === userId);
        setUsuarioSeleccionado(info || null);
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
    if (!userId) return;
    const conversacion = todasConversaciones.find((c) => c.userId === userId);
    if (conversacion && conversacion.intervenidaPor) {
      setAgente(conversacion.intervenidaPor);
    } else {
      setAgente(null);
    }
  }, [userId, todasConversaciones]);

  useEffect(() => {
    if (userId) {
      fetch("https://web-production-51989.up.railway.app/api/marcar-visto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
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

  const paisAToIso = (paisTexto) => {
    const mapa = {
      Spain: "es",
      France: "fr",
      Italy: "it",
      Mexico: "mx",
      Argentina: "ar",
      Colombia: "co",
      Chile: "cl",
      Peru: "pe",
      "United States": "us",
    };
    return mapa[paisTexto] ? mapa[paisTexto].toLowerCase() : null;
  };

  const conversacionesPorUsuario = todasConversaciones.reduce((acc, item) => {
    const actual = acc[item.userId] || { mensajes: [], estado: "abierta" };
    actual.mensajes = [...(actual.mensajes || []), ...(item.mensajes || [])];
    actual.pais = item.pais;
    actual.navegador = item.navegador;
    actual.historial = item.historial || [];
    actual.intervenida = item.intervenida || false;
    acc[item.userId] = actual;
    return acc;
  }, {});

  const listaAgrupada = Object.entries(conversacionesPorUsuario)
    .map(([id, info]) => {
      const ultimaVista = id === userId ? new Date() : vistas[id];
      const mensajesValidos = Array.isArray(info.mensajes) ? info.mensajes : [];
      const ultimoMensaje = mensajesValidos.sort((a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction))[0];
      const minutosDesdeUltimo = ultimoMensaje ? (Date.now() - new Date(ultimoMensaje.lastInteraction)) / 60000 : Infinity;
      let estado = "Archivado";
      if (minutosDesdeUltimo <= 2) estado = "Activa";
      else if (minutosDesdeUltimo <= 10) estado = "Inactiva";
      const nuevos = mensajesValidos.filter((m) => m.from?.toLowerCase() === "usuario" && (!ultimaVista || new Date(m.lastInteraction) > new Date(ultimaVista))).length;
      return { userId: id, nuevos, estado, lastInteraction: ultimoMensaje ? ultimoMensaje.lastInteraction : info.lastInteraction, iniciales: id.slice(0, 2).toUpperCase(), intervenida: info.intervenida || false, intervenidaPor: info.intervenidaPor || null, pais: info.pais || "Desconocido", navegador: info.navegador || "Desconocido", historial: info.historial || [] };
    })
    .sort((a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction))
    .filter((c) => filtro === "todas" || (filtro === "gpt" && !c.intervenida) || (filtro === "humanas" && c.intervenida));

  const totalNoLeidos = listaAgrupada.filter((c) => c.nuevos > 0).length;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("notificaciones-nuevas", { detail: { total: totalNoLeidos } }));
  }, [totalNoLeidos]);
    const estadoColor = { Activa: "bg-green-500", Inactiva: "bg-gray-400", Archivado: "bg-black" };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f0f4f8] relative">
      <div className={`flex flex-1 p-4 gap-4 overflow-hidden h-[calc(100dvh-5.5rem)]`}>
        {/* Lista de conversaciones */}
        <div className={`bg-white rounded-lg shadow-md overflow-y-auto h-full
          ${vistaMovil === "lista" ? "flex-1 md:w-1/5" : "hidden md:block md:w-1/5"}
          ${vistaMovil === "lista" ? "p-2 md:p-4" : "p-4"}`}>
          <h2 className="text-sm text-gray-400 font-semibold mb-2 ml-2 md:ml-0">Conversaciones</h2>
          <div className="flex gap-2 mb-3 ml-2 md:ml-0">
            {["todas", "gpt", "humanas"].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`text-xs px-2 py-1 rounded-full border ${
                  filtro === f ? "bg-blue-600 text-white" : "bg-white text-gray-700"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {listaAgrupada.map((c) => (
            <div
              key={c.userId}
              onClick={() => {
                setSearchParams({ userId: c.userId });
                setVistaMovil("chat");
              }}
              className={`flex items-center justify-between cursor-pointer px-3 py-3 md:px-2 md:py-2 rounded hover:bg-gray-100 ${
                c.userId === userId ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center gap-3 md:gap-2 relative">
                <div className="relative">
                  <div className="bg-gray-200 w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                    {c.iniciales}
                  </div>
                  {paisAToIso(c.pais) ? (
                    <img
                      src={`https://flagcdn.com/16x12/${paisAToIso(c.pais)}.png`}
                      alt={c.pais}
                      className="absolute -bottom-1 -right-2 w-4 h-3 rounded-sm border"
                    />
                  ) : (
                    <span className="absolute -bottom-1 -right-2 text-xs">🌐</span>
                  )}
                  {c.nuevos > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      {c.nuevos}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{c.userId}</div>
                  <div className="text-xs text-gray-500">{formatearTiempo(c.lastInteraction)}</div>
                </div>
              </div>
              <span
                className={`text-[10px] text-white px-2 py-0.5 rounded-full ${estadoColor[c.estado]}`}
              >
                {c.estado}
              </span>
            </div>
          ))}
        </div>

        {/* Columna chat */}
        <div className={`bg-white rounded-lg shadow-md flex flex-col overflow-hidden h-full relative
          ${vistaMovil === "chat" ? "flex-1 md:flex" : "hidden md:flex md:flex-1"}`}>
          <div
            ref={chatRef}
            onScroll={() => {
              const el = chatRef.current;
              if (!el) return;
              const alFinal = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
              scrollForzado.current = alFinal;
              setMostrarScrollBtn(!alFinal);
            }}
            className="flex-1 overflow-y-auto p-6 space-y-4 h-0"
          >
            {mensajes.map((msg, index) => {
              const isAsistente = msg.from?.toLowerCase() === "asistente";
              const bubbleColor = isAsistente
                ? "bg-[#ff5733] text-white"
                : "bg-white text-gray-800 border";
              const align = isAsistente ? "justify-end" : "justify-start";
              return (
                <div key={index} className={`flex ${align}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-md ${bubbleColor}`}>
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

          {mostrarScrollBtn && (
            <button
              onClick={() =>
                chatRef.current?.scrollTo({
                  top: chatRef.current.scrollHeight,
                  behavior: "smooth",
                })
              }
              className="absolute bottom-20 right-6 bg-blue-600 text-white px-3 py-1 text-xs rounded-full shadow hover:bg-blue-700"
            >
              Ir al final
            </button>
          )}

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
                    uid: localStorage.getItem("id-usuario-panel") || null
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

          {/* Botones flotantes móvil */}
          <div className="md:hidden fixed bottom-4 right-4 flex flex-col gap-3">
            {vistaMovil === "chat" && (
              <>
                <button
                  onClick={() => setVistaMovil("lista")}
                  className="bg-gray-700 text-white px-3 py-2 rounded-full shadow"
                >
                  Volver
                </button>
                <button
                  onClick={() => setVistaMovil("detalles")}
                  className="bg-blue-600 text-white px-3 py-2 rounded-full shadow"
                >
                  Ver detalles
                </button>
              </>
            )}
            {vistaMovil === "detalles" && (
              <button
                onClick={() => setVistaMovil("chat")}
                className="bg-gray-700 text-white px-3 py-2 rounded-full shadow"
              >
                Volver
              </button>
            )}
          </div>
        </div>
                {/* Columna detalles */}
        <div className={`bg-white rounded-lg shadow-md p-4 h-full overflow-y-auto 
          ${vistaMovil === "detalles" ? "flex-1 md:w-1/5" : "hidden md:block md:w-1/5"}`}>
          {agente && (
            <div className="mb-4">
              <h3 className="text-xs text-gray-500">Intervenido por</h3>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={agente.foto || "https://i.pravatar.cc/100"}
                  alt="Agente"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {agente.nombre || "—"}
                </span>
              </div>
            </div>
          )}
          <h2 className="text-sm text-gray-400 font-semibold mb-2">
            Datos del usuario
          </h2>
          {usuarioSeleccionado ? (
            <div className="text-sm text-gray-700 space-y-1">
              <p>ID: {usuarioSeleccionado.userId}</p>
              <p>Navegador: {usuarioSeleccionado.navegador}</p>
              <p>
                País:{" "}
                {paisAToIso(usuarioSeleccionado.pais) ? (
                  <img
                    src={`https://flagcdn.com/24x18/${paisAToIso(usuarioSeleccionado.pais)}.png`}
                    alt={usuarioSeleccionado.pais}
                    className="inline-block ml-1"
                  />
                ) : (
                  <span className="ml-1">🌐</span>
                )}
              </p>
              <p>Historial:</p>
              <ul className="list-disc list-inside text-xs text-gray-600">
                {usuarioSeleccionado.historial.map((url, idx) => (
                  <li key={idx}>{url}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Selecciona una conversación</p>
          )}
        </div>
      </div>

      {/* Bloque enviar email solo visible en escritorio */}
      <div className="hidden md:block w-full px-6 py-4">
        <div className="w-full bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-center gap-4">
          <input
            type="email"
            value={emailDestino}
            onChange={(e) => setEmailDestino(e.target.value)}
            placeholder="Correo electrónico del destinatario"
            className="w-full sm:w-2/3 border border-gray-300 rounded px-4 py-2 text-sm"
          />
          <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700">
            Enviar por email
          </button>
        </div>
      </div>
    </div>
  );
}
