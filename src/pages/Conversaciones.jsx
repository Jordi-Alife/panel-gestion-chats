import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConversacionList from "../components/ConversacionList";
import ChatPanel from "../components/ChatPanel";
import FormularioRespuesta from "../components/FormularioRespuesta";
import DetallesUsuario from "../components/DetallesUsuario";

export default function Conversaciones() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get("userId") || null;

  const [mostrarDetalles, setMostrarDetalles] = useState(false); // ✅ nuevo estado

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
    const cargarMensajes = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`);
      const data = await res.json();
      console.log("Mensajes recibidos:", data);
      window.__mensajes = data;

      const ordenados = (data || []).sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction));

      const mensajesConEtiqueta = [];
      let estadoActual = "gpt";

      for (let i = 0; i < ordenados.length; i++) {
        const msg = ordenados[i];

        if (msg.tipo === "estado" && msg.estado === "Traspasado a GPT") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Traspasado a GPT",
            timestamp: msg.lastInteraction,
          });
          estadoActual = "gpt";
        }

        if (msg.tipo === "estado" && msg.estado === "Cerrado") {
  mensajesConEtiqueta.push({
    tipo: "etiqueta",
    mensaje: "El usuario ha cerrado el chat",
    timestamp: msg.lastInteraction,
  });
}
        if (msg.manual === true && estadoActual === "gpt") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Intervenida",
            timestamp: msg.lastInteraction,
          });
          estadoActual = "humano";
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
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

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
  actual.estado = item.estado || "abierta"; // ← ✅ AÑADE ESTA LÍNEA
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

    // 🟥 Si la conversación está cerrada, mostrar como 'Cerrado' solo si no hay actividad posterior
    const fueCerrada = info.estado?.toLowerCase() === "cerrado";
    const tieneActividadPostCierre = minutosDesdeUltimo <= 2;

    if (fueCerrada && !tieneActividadPostCierre) {
      estado = "Cerrado";
    } else if (minutosDesdeUltimo <= 2) {
      estado = "Activa";
    } else if (minutosDesdeUltimo <= 10) {
      estado = "Inactiva";
    }

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

  return (
  <div className="flex flex-row h-[calc(100vh-88px)] bg-[#f0f4f8] overflow-hidden">
    {/* Columna izquierda */}
    <div className="w-1/5 h-full overflow-y-auto">
      <ConversacionList
        conversaciones={listaAgrupada}
        userIdActual={userId}
        onSelect={(id) => setSearchParams({ userId: id })}
        filtro={filtro}
        setFiltro={setFiltro}
        paisAToIso={paisAToIso}
        formatearTiempo={formatearTiempo}
      />
    </div>

    {/* Columna central */}
    <div className="flex flex-col flex-1 bg-white rounded-lg shadow-md mx-4 mt-4 overflow-hidden h-full">
      <ChatPanel
        mensajes={mensajes}
        textoEscribiendo={textoEscribiendo}
        originalesVisibles={originalesVisibles}
        setOriginalesVisibles={setOriginalesVisibles}
        chatRef={chatRef}
        onScroll={() => {
          const el = chatRef.current;
          if (!el) return;
          const alFinal = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
          scrollForzado.current = alFinal;
          setMostrarScrollBtn(!alFinal);
        }}
        userId={userId}
        onToggleDetalles={() => setMostrarDetalles((prev) => !prev)}
      />
      <FormularioRespuesta
        userId={userId}
        respuesta={respuesta}
        setRespuesta={setRespuesta}
        imagen={imagen}
        setImagen={setImagen}
        perfil={perfil}
        cargarDatos={cargarDatos}
        setUsuarioSeleccionado={setUsuarioSeleccionado}
      />
    </div>

    {/* Columna derecha */}
    {mostrarDetalles && (
      <div className="w-1/5 h-full overflow-y-auto">
        <DetallesUsuario
          usuario={usuarioSeleccionado}
          agente={agente}
          paisAToIso={paisAToIso}
          cargarDatos={cargarDatos}
          setUsuarioSeleccionado={setUsuarioSeleccionado}
          todasConversaciones={todasConversaciones}
        />
      </div>
    )}
  </div>
);
