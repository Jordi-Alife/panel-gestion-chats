import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConversacionList from "../../components/ConversacionList";
import ChatPanel from "../../components/ChatPanel";
import FormularioRespuesta from "../../components/FormularioRespuesta";
import DetallesUsuario from "../../components/DetallesUsuario";
import logoFondo from "../../assets/logo-fondo.svg";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
console.log("👉 BACKEND URL:", import.meta.env.VITE_BACKEND_URL);

export default function Archivadas() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId") || null;

  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [todasConversaciones, setTodasConversaciones] = useState([]);
  const [vistas, setVistas] = useState({});
  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);
  const [filtro, setFiltro] = useState("todas");
  const tipoVisualizacion = "archivadas";
  const [agente, setAgente] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [textoEscribiendo, setTextoEscribiendo] = useState("");
  const [chatCerrado, setChatCerrado] = useState(false);
  const [limiteMensajes, setLimiteMensajes] = useState(25);
  const [hayMasMensajes, setHayMasMensajes] = useState(true);
  const chatRef = useRef(null);
  const scrollForzado = useRef(true);

  useEffect(() => {
  cargarDatos("archivo");
}, []);

  useEffect(() => {
    if (!userId) return;
    cargarMensajes(false);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      const estadoChat = localStorage.getItem('chatEstado');
      if (estadoChat !== "abierto") return;
      fetch(`/api/escribiendo/${userId}`)
        .then((res) => res.json())
        .then((data) => setTextoEscribiendo(data.texto || ""))
        .catch(console.error);
    }, 5000);
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
      fetch(`${BACKEND_URL}/api/marcar-visto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    }
  }, [userId]);

  const cargarDatos = async (tipo = "archivo") => {
    try {
      const url = `${BACKEND_URL}/api/conversaciones?tipo=${tipo}`;
      const res = await fetch(url);
      const text = await res.text();
      console.log(`🔎 Respuesta cruda desde /api/conversaciones?tipo=${tipo}:`, text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("❌ Error al parsear JSON:", jsonErr);
        return [];
      }
      setTodasConversaciones(data);
      const vistasRes = await fetch(`${BACKEND_URL}/api/vistas`);
      const vistasData = await vistasRes.json();
      setVistas(vistasData);
      return data;
    } catch (err) {
      console.error("❌ Error en cargarDatos:", err);
      return [];
    }
  };

  const cargarMensajes = async (verMas = false) => {
    if (!userId) return;
    const convData = localStorage.getItem(`conversacion-${userId}`);
    let conv = null;
    try {
      conv = JSON.parse(convData);
    } catch {}

    if (
      conv &&
      ["archivado", "cerrado"].includes((conv.estado || "").toLowerCase()) &&
      conv.historialFormateado
    ) {
      const lineas = conv.historialFormateado.split("\n");
      const mensajesHist = lineas.map((linea, i) => {
        const esUsuario = linea.startsWith("Usuario:");
        const esAsistente = linea.startsWith("Asistente:");
        return {
          id: `hist-${i}`,
          from: esUsuario ? "usuario" : esAsistente ? "asistente" : "sistema",
          message: linea.replace(/^Usuario:\s?|^Asistente:\s?/, ""),
          tipo: "texto",
          lastInteraction: conv.ultimaRespuesta || conv.fechaInicio || new Date().toISOString(),
        };
      });
      setMensajes(mensajesHist);
      setHayMasMensajes(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/conversaciones/${userId}`);
      const data = await res.json();
      window.__mensajes = data;
      const ordenados = (data || []).sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction));
      const mensajesConEtiqueta = [];
      let estadoActual = "gpt";
      for (let i = 0; i < ordenados.length; i++) {
        const msg = ordenados[i];
        const ultimaEtiqueta = mensajesConEtiqueta.length ? mensajesConEtiqueta[mensajesConEtiqueta.length - 1] : null;
        if (msg.tipo === "estado" && msg.estado === "Traspasado a GPT") {
          if (!ultimaEtiqueta || ultimaEtiqueta.mensaje !== "Traspasado a GPT") {
            mensajesConEtiqueta.push({ tipo: "etiqueta", mensaje: "Traspasado a GPT", timestamp: msg.lastInteraction });
          }
          estadoActual = "gpt";
        }
        if (msg.tipo === "estado" && msg.estado === "Cerrado") {
          if (!ultimaEtiqueta || ultimaEtiqueta.mensaje !== "El usuario ha cerrado el chat") {
            mensajesConEtiqueta.push({ tipo: "etiqueta", mensaje: "El usuario ha cerrado el chat", timestamp: msg.lastInteraction });
          }
        }
        if (msg.manual === true && estadoActual === "gpt") {
          if (!ultimaEtiqueta || ultimaEtiqueta.mensaje !== "Intervenida") {
            mensajesConEtiqueta.push({ tipo: "etiqueta", mensaje: "Intervenida", timestamp: msg.lastInteraction });
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
      const ordenadosFinal = Array.from(mapa.values()).sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction));
      const nuevoLimite = verMas ? limiteMensajes + 25 : limiteMensajes;
      const nuevosVisibles = ordenadosFinal.slice(-nuevoLimite);
      if (verMas) {
        setLimiteMensajes(nuevoLimite);
        setMensajes(ordenadosFinal.slice(-nuevoLimite));
      } else {
        setMensajes(nuevosVisibles);
      }
      setHayMasMensajes(ordenadosFinal.length > nuevosVisibles.length);
      let nuevaInfo = todasConversaciones.find((c) => c.userId === userId);
      if (!nuevaInfo) {
        const fallback = await fetch(`${BACKEND_URL}/api/conversaciones?tipo=recientes`);
        const fallbackData = await fallback.json();
        nuevaInfo = fallbackData.find((c) => c.userId === userId) || null;
      }
      setUsuarioSeleccionado((prev) => {
        if (!prev || !prev.intervenida) {
          return nuevaInfo || null;
        }
        return prev;
      });
      setChatCerrado(nuevaInfo?.chatCerrado || false);
      setTimeout(() => {
        if (scrollForzado.current && chatRef.current) {
          chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "auto" });
        }
      }, 100);
    } catch (err) {
      console.error("❌ Error en cargarMensajes:", err);
    }
  };

  window.cargarMensajes = cargarMensajes;
  
  const conversacionesPorUsuario = todasConversaciones.reduce((acc, item) => {
  const actual = acc[item.userId] || { mensajes: [], estado: "abierta" };
  actual.mensajes = [...(actual.mensajes || []), ...(item.mensajes || [])];
  actual.intervenida = item.intervenida || false;
  actual.chatCerrado = item.chatCerrado || false;
  actual.estado = item.estado || "abierta";
  actual.lastInteraction = item.lastInteraction || item.ultimaRespuesta || item.fechaInicio || new Date().toISOString();
  actual.noVistos = item.noVistos || 0;
  actual.intervenidaPor = item.intervenidaPor || null;
  acc[item.userId] = actual;
  return acc;
}, {});

const listaAgrupada = Object.entries(conversacionesPorUsuario)
  .map(([id, info]) => ({
    userId: id,
    noVistos: info.noVistos || 0,
    estado: (info.estado || "").toLowerCase() === "cerrado" ? "Cerrado" : "Archivado",
    lastInteraction: info.lastInteraction,
    iniciales: id.slice(0, 2).toUpperCase(),
    intervenida: info.intervenida,
    intervenidaPor: info.intervenidaPor,
    chatCerrado: info.chatCerrado,
  }))
  .sort((a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction));
  return (
    <div className="w-screen h-screen flex">
      <ConversacionList
  todasConversaciones={listaAgrupada}
        userId={userId}
        setSearchParams={setSearchParams}
        vistas={vistas}
        filtro={filtro}
        setFiltro={setFiltro}
        tipoVisualizacion={tipoVisualizacion}
      />

      <div className="flex flex-col w-[58%] h-full border-l border-r border-gray-300 relative">
        {userId ? (
          <ChatPanel
            chatRef={chatRef}
            mensajes={mensajes}
            setMensajes={setMensajes}
            mostrarScrollBtn={mostrarScrollBtn}
            setMostrarScrollBtn={setMostrarScrollBtn}
            cargarMensajes={cargarMensajes}
            hayMasMensajes={hayMasMensajes}
            setHayMasMensajes={setHayMasMensajes}
            scrollForzado={scrollForzado}
            originalVisible={originalesVisibles}
            setOriginalVisible={setOriginalesVisibles}
            textoEscribiendo={textoEscribiendo}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <img src={logoFondo} alt="Next Lives" className="w-32 h-32 mb-4 opacity-20" />
            <p className="text-center">Selecciona una conversación para ver los mensajes</p>
          </div>
        )}

        {userId && !chatCerrado && (
          <FormularioRespuesta
            respuesta={respuesta}
            setRespuesta={setRespuesta}
            imagen={imagen}
            setImagen={setImagen}
            cargarMensajes={cargarMensajes}
            userId={userId}
            mensajes={mensajes}
            setMensajes={setMensajes}
            setChatCerrado={setChatCerrado}
          />
        )}
      </div>

      <DetallesUsuario
        mostrarDetalles={mostrarDetalles}
        setMostrarDetalles={setMostrarDetalles}
        userId={userId}
        usuarioSeleccionado={usuarioSeleccionado}
        tipoVisualizacion={tipoVisualizacion}
        setUsuarioSeleccionado={setUsuarioSeleccionado}
        agente={agente}
        setAgente={setAgente}
        cargarMensajes={cargarMensajes}
      />
    </div>
  );
}
