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
  const [emailDestino, setEmailDestino] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [textoEscribiendo, setTextoEscribiendo] = useState("");
  const [chatCerrado, setChatCerrado] = useState(false);
  const chatRef = useRef(null);
  const scrollForzado = useRef(true);

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  const cargarDatos = async () => {
    try {
      const res = await fetch("https://web-production-51989.up.railway.app/api/conversaciones");
      const data = await res.json();
      setTodasConversaciones(data);

      const vistasRes = await fetch("https://web-production-51989.up.railway.app/api/vistas");
      const vistasData = await vistasRes.json();
      setVistas(vistasData);

      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarMensajes = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`);
      const data = await res.json();
      const ordenados = (data || []).sort(
        (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
      );

      const mensajesConEtiqueta = [];
      let insertadaIntervenida = false;
      let insertadaGPT = false;
      let insertadaCerrado = false;

      for (let i = 0; i < ordenados.length; i++) {
        const msg = ordenados[i];

        if (!insertadaIntervenida && msg.manual && msg.from?.toLowerCase() === "asistente") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Intervenida",
            timestamp: msg.lastInteraction,
          });
          insertadaIntervenida = true;
        }

        if (!insertadaGPT && msg.tipo === "estado" && msg.estado === "Traspasado a GPT") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Traspasado a GPT",
            timestamp: msg.lastInteraction,
          });
          insertadaGPT = true;
        }

        if (!insertadaCerrado && msg.tipo === "estado" && msg.estado === "Cerrado") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Cerrado",
            timestamp: msg.lastInteraction,
          });
          insertadaCerrado = true;
        }

        mensajesConEtiqueta.push(msg);
      }

      setMensajes(mensajesConEtiqueta);

      const nuevasConversaciones = await cargarDatos();
      const nuevaInfo = nuevasConversaciones.find((c) => c.userId === userId);
      setUsuarioSeleccionado(nuevaInfo || null);
      setChatCerrado(nuevaInfo?.chatCerrado || false);

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
    if (!userId) return;
    const interval = setInterval(() => {
      fetch(`https://web-production-51989.up.railway.app/api/escribiendo/${userId}`)
        .then((res) => res.json())
        .then((data) => setTextoEscribiendo(data.texto || ""))
        .catch(console.error);
    }, 2000);
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
    actual.chatCerrado = item.chatCerrado || false;
    acc[item.userId] = actual;
    return acc;
  }, {});

  const listaAgrupada = Object.entries(conversacionesPorUsuario)
    .map(([id, info]) => {
      const ultimaVista = id === userId ? new Date() : vistas[id];
      const mensajesValidos = Array.isArray(info.mensajes) ? info.mensajes : [];
      const ultimoMensaje = mensajesValidos.sort(
        (a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction)
      )[0];
      const minutosDesdeUltimo = ultimoMensaje
        ? (Date.now() - new Date(ultimoMensaje.lastInteraction)) / 60000
        : Infinity;
      let estado = "Archivado";
      if (minutosDesdeUltimo <= 2) estado = "Activa";
      else if (minutosDesdeUltimo <= 10) estado = "Inactiva";
      const nuevos = mensajesValidos.filter(
        (m) =>
          m.from?.toLowerCase() === "usuario" &&
          (!ultimaVista || new Date(m.lastInteraction) > new Date(ultimaVista))
      ).length;
      return {
        userId: id,
        nuevos,
        estado,
        lastInteraction: ultimoMensaje ? ultimoMensaje.lastInteraction : info.lastInteraction,
        iniciales: id.slice(0, 2).toUpperCase(),
        intervenida: info.intervenida || false,
        intervenidaPor: info.intervenidaPor || null,
        pais: info.pais || "Desconocido",
        navegador: info.navegador || "Desconocido",
        historial: info.historial || [],
        chatCerrado: info.chatCerrado || false,
      };
    })
    .sort((a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction))
    .filter(
      (c) =>
        filtro === "todas" ||
        (filtro === "gpt" && !c.intervenida) ||
        (filtro === "humanas" && c.intervenida)
    );

  const totalNoLeidos = listaAgrupada.filter((c) => c.nuevos > 0).length;

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("notificaciones-nuevas", { detail: { total: totalNoLeidos } })
    );
  }, [totalNoLeidos]);

  const estadoColor = {
    Activa: "bg-green-500",
    Inactiva: "bg-gray-400",
    Archivado: "bg-black",
  };
    return (
    <div className="flex flex-row h-screen min-h-screen bg-[#f0f4f8] relative">
      {/* Lista de conversaciones */}
      <div className="bg-white w-1/5 rounded-lg shadow-md overflow-y-auto">
        <h2 className="text-sm text-gray-400 font-semibold mb-2 px-4">Conversaciones</h2>
        <div className="flex gap-2 mb-3 px-4">
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
            onClick={() => setSearchParams({ userId: c.userId })}
            className={`flex items-center justify-between cursor-pointer px-4 py-3 rounded hover:bg-gray-100 ${
              c.userId === userId ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center gap-3 relative">
              <div className="relative">
                <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
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
                {c.chatCerrado && (
                  <div className="text-[10px] text-red-500 mt-1">⚠ Usuario ha cerrado el chat</div>
                )}
              </div>
            </div>
            <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ${estadoColor[c.estado]}`}>
              {c.estado}
            </span>
          </div>
        ))}
      </div>

      <div
  ref={chatRef}
  onScroll={() => {
    const el = chatRef.current;
    if (!el) return;
    const alFinal = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
    scrollForzado.current = alFinal;
    setMostrarScrollBtn(!alFinal);
  }}
  className="flex-1 overflow-y-auto p-6 space-y-4"
>
  {mensajes.length === 0 && (
    <p className="text-sm text-gray-500 text-center">No hay mensajes para mostrar.</p>
  )}

  {mensajes.map((msg, index) => {
    if (msg.tipo === "etiqueta") {
      return (
        <div key={`etiqueta-${index}`} className="flex justify-center">
          <span className={`text-xs uppercase tracking-wide px-3 py-1 rounded-2xl font-semibold fade-in ${
            msg.mensaje === "Intervenida"
              ? "bg-blue-100 text-blue-600"
              : msg.mensaje === "Traspasado a GPT"
              ? "bg-blue-100 text-blue-600"
              : msg.mensaje === "Cerrado"
              ? "bg-red-100 text-red-600"
              : "bg-gray-200 text-gray-800"
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
    const contenidoPrincipal = msg.manual ? msg.original : msg.message;
    const contenidoSecundario = msg.manual ? msg.message : msg.original;

    return (
      <div key={index} className={`flex ${align}`}>
        <div className={`max-w-[80%] p-3 shadow ${shapeClass} ${
          msg.manual
            ? "bg-[#2563eb] text-white"
            : isAsistente
            ? "bg-black text-white"
            : "bg-[#f7f7f7] text-gray-800 border"
        }`}>
          {contenidoPrincipal.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
            <img
              src={contenidoPrincipal}
              alt="Imagen"
              className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain"
            />
          ) : (
            <p className="whitespace-pre-wrap text-[15px]">{contenidoPrincipal}</p>
          )}
          {contenidoSecundario && (
            <div className="mt-2 text-[11px] text-right">
              <button
                onClick={() =>
                  setOriginalesVisibles((prev) => ({ ...prev, [index]: !prev[index] }))
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

          {/* Caja de respuesta */}
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
              setUsuarioSeleccionado((prev) => ({ ...prev, intervenida: true }));
              cargarDatos();
            }}
            className="border-t px-4 py-3 flex items-center gap-2"
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
              Enviar
            </button>
          </form>
        </div>

        {/* Columna detalles */}
        <div className="w-1/5 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          {agente && (
            <div className="mb-4">
              <h3 className="text-xs text-gray-500">Intervenido por</h3>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={agente.foto || "https://i.pravatar.cc/100?u=default"}
                  alt="Agente"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-700">
                  {agente.nombre || "—"}
                </span>
              </div>
            </div>
          )}
          {usuarioSeleccionado?.intervenida ? (
            <button
              onClick={async () => {
                try {
                  const res = await fetch("https://web-production-51989.up.railway.app/api/liberar-conversacion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: usuarioSeleccionado.userId }),
                  });
                  const data = await res.json();
                  if (data.ok) {
                    alert("✅ Conversación liberada");
                    await cargarDatos();
                    const conversacionActualizada = todasConversaciones.find(
                      (c) => c.userId === usuarioSeleccionado.userId
                    );
                    if (conversacionActualizada) {
                      setUsuarioSeleccionado(conversacionActualizada);
                    }
                  } else {
                    alert("⚠️ Error al liberar conversación");
                  }
                } catch (error) {
                  console.error("❌ Error liberando conversación:", error);
                  alert("❌ Error liberando conversación");
                }
              }}
              className="mt-2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
            >
              Liberar conversación
            </button>
          ) : (
            <div className="mt-2 bg-gray-400 text-white text-xs px-3 py-1 rounded text-center cursor-default">
              Traspasado a GPT
            </div>
          )}

          <h2 className="text-sm text-gray-400 font-semibold mb-2">Datos del usuario</h2>
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
              {usuarioSeleccionado.chatCerrado && (
                <p className="text-xs text-red-500 mt-1">⚠ Usuario ha cerrado el chat</p>
              )}
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
    </div>
  );
}
