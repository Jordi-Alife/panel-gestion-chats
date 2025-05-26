import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConversacionList from "../components/ConversacionList";
import ChatPanel from "../components/ChatPanel";
import FormularioRespuesta from "../components/FormularioRespuesta";
import DetallesUsuario from "../components/DetallesUsuario";
import logoFondo from "../assets/logo-fondo.svg";

export default function Conversaciones() {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [tipoVisualizacion, setTipoVisualizacion] = useState("recientes");
  const [agente, setAgente] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [textoEscribiendo, setTextoEscribiendo] = useState("");
  const [chatCerrado, setChatCerrado] = useState(false);
  const [limiteMensajes, setLimiteMensajes] = useState(25);
  const [hayMasMensajes, setHayMasMensajes] = useState(true);
  const chatRef = useRef(null);
  const scrollForzado = useRef(true);

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  const cargarDatos = async (tipo = "recientes") => {
    try {
      const res = await fetch(`https://web-production-51989.up.railway.app/api/conversaciones?tipo=${tipo}`);
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
    const cargarMensajes = async (verMas = false) => {
    if (!userId) return;
    try {
      const res = await fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`);
      const data = await res.json();
      window.__mensajes = data;

      const ordenados = (data || []).sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction));
      const nuevosMensajes = [];
      let estadoActual = "gpt";

      for (let i = 0; i < ordenados.length; i++) {
        const msg = ordenados[i];

        if (msg.tipo === "estado" && msg.estado === "Traspasado a GPT") {
          nuevosMensajes.push({
            tipo: "etiqueta",
            mensaje: "Traspasado a GPT",
            timestamp: msg.lastInteraction,
          });
          estadoActual = "gpt";
        }

        if (msg.tipo === "estado" && msg.estado === "Cerrado") {
          nuevosMensajes.push({
            tipo: "etiqueta",
            mensaje: "El usuario ha cerrado el chat",
            timestamp: msg.lastInteraction,
          });
        }

        if (msg.manual === true && estadoActual === "gpt") {
          nuevosMensajes.push({
            tipo: "etiqueta",
            mensaje: "Intervenida",
            timestamp: msg.lastInteraction,
          });
          estadoActual = "humano";
        }

        nuevosMensajes.push(msg);
      }

      const mapa = new Map();
      nuevosMensajes.forEach((m) => {
        const clave = m.id || `${m.timestamp}-${m.rol}-${m.tipo}-${m.message}`;
        mapa.set(clave, m);
      });

      const ordenadosFinal = Array.from(mapa.values()).sort(
        (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
      );

      let nuevoLimite = verMas ? limiteMensajes + 25 : limiteMensajes;
      const nuevosVisibles = ordenadosFinal.slice(-nuevoLimite);

      if (verMas) {
        setLimiteMensajes(nuevoLimite);
        setMensajes(ordenadosFinal.slice(-nuevoLimite));
      } else {
        setMensajes(nuevosVisibles);
      }

      setHayMasMensajes(ordenadosFinal.length > nuevosVisibles.length);

      // ✅ Ya no recargamos las conversaciones (evita sobrescribir)
let nuevaInfo = todasConversaciones.find((c) => c.userId === userId);
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
  
// ✅ Solo un useEffect, evita doble carga y conflictos
useEffect(() => {
  if (tipoVisualizacion === "archivadas") {
    console.log("📦 Cargando archivadas");
    cargarDatos("archivadas");
    return; // no hay refresco
  }

  if (tipoVisualizacion === "recientes") {
    console.log("📡 Cargando recientes con refresco cada 5s");
    cargarDatos("recientes");
    const intervalo = setInterval(() => cargarDatos("recientes"), 5000);
    return () => clearInterval(intervalo);
  }
}, [tipoVisualizacion]);

  useEffect(() => {
    const refrescar = () => cargarMensajes(false);
    refrescar();
    const interval = setInterval(refrescar, 2000);
    return () => clearInterval(interval);
  }, [userId, limiteMensajes]);

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
    actual.estado = item.estado || "abierta";
    actual.lastInteraction = item.lastInteraction || item.ultimaRespuesta || item.fechaInicio || new Date().toISOString();
    actual.noVistos = item.noVistos || 0;
    acc[item.userId] = actual;
    return acc;
  }, {});
    const listaAgrupada = Object.entries(conversacionesPorUsuario)
    .map(([id, info]) => {
      const ultimaVista = id === userId ? new Date() : vistas[id];

      const minutosDesdeUltimo = info.lastInteraction
        ? (Date.now() - new Date(info.lastInteraction)) / 60000
        : Infinity;

      // ✅ Nueva lógica: liberar si está intervenida y pasa a Archivado
      if (
        info.intervenida &&
        minutosDesdeUltimo > 10 &&
        (info.estado || "").toLowerCase() !== "cerrado"
      ) {
        fetch("https://web-production-51989.up.railway.app/api/liberar-conversacion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }),
        })
          .then(() => {
            console.log(`✅ Conversación ${id} liberada automáticamente al pasar a Archivado`);
          })
          .catch((err) => {
            console.error(`❌ Error liberando conversación ${id} automáticamente:`, err);
          });
      }

      let estado = (() => {
  const base = (info.estado || "").toLowerCase();
  if (base === "cerrado") return "Cerrado";
  if (base === "archivado") return "Archivado";
  if (base === "abierta") {
    if (minutosDesdeUltimo <= 2) return "Activa";
    if (minutosDesdeUltimo <= 10) return "Inactiva";
    return "Archivado";
  }
  return "Archivado";
})();

      return {
        userId: id,
        noVistos: info.noVistos || 0,
        estado, // ya está estandarizado en el bloque anterior
        lastInteraction: info.lastInteraction || info.fechaInicio || new Date().toISOString(),
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
    <div className="flex flex-row h-screen bg-[#f0f4f8] dark:bg-gray-950 overflow-hidden">
      
      {/* Columna izquierda */}
<div className="w-[22%] h-full overflow-y-auto">
  <ConversacionList
  conversaciones={(() => {
    const estadoFiltrado = listaAgrupada.filter((c) => {
      const estado = c.estado || "";
      if (tipoVisualizacion === "archivadas") {
  return estado === "Cerrado" || estado === "Archivado";
} else {
        return estado === "Activa" || estado === "Inactiva";
      }
    });
    return estadoFiltrado;
  })()}
  userIdActual={userId}
  onSelect={(id) => setSearchParams({ userId: id })}
  filtro={filtro}
  setFiltro={setFiltro}
  tipoVisualizacion={tipoVisualizacion}
  setTipoVisualizacion={setTipoVisualizacion}
  paisAToIso={paisAToIso}
  formatearTiempo={formatearTiempo}
/>
</div>

      {/* Columna central */}
      <div className="flex flex-col flex-1 bg-white rounded-lg shadow-md mx-4 overflow-hidden h-full">
        {mensajes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
            <img
              src={logoFondo}
              alt="Logo NextLives"
              className="w-48 opacity-30"
            />
          </div>
        ) : (
          <>
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
              onCargarMas={() => cargarMensajes(true)}
              hayMas={hayMasMensajes}
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
          </>
        )}
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
}
