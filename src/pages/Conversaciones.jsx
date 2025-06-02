import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConversacionList from "../components/ConversacionList";
import ChatPanel from "../components/ChatPanel";
import FormularioRespuesta from "../components/FormularioRespuesta";
import DetallesUsuario from "../components/DetallesUsuario";
import logoFondo from "../assets/logo-fondo.svg";

// ✅ Definir aquí, fuera del componente
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
console.log("👉 BACKEND URL:", import.meta.env.VITE_BACKEND_URL);

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
  const [tipoVisualizacion, setTipoVisualizacion] = useState("archivadas");
  const [agente, setAgente] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [textoEscribiendo, setTextoEscribiendo] = useState("");
  const [chatCerrado, setChatCerrado] = useState(false);
  const [limiteMensajes, setLimiteMensajes] = useState(25);
  const [hayMasMensajes, setHayMasMensajes] = useState(true);
  const chatRef = useRef(null);
  const scrollForzado = useRef(true);

  // ✅ Cargar mensajes inmediatamente al seleccionar conversación
useEffect(() => {
  if (!userId) return;
  cargarMensajes(false);
}, [userId]);

  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  const cargarDatos = async (tipo = "recientes") => {
  try {
    const url = `${BACKEND_URL}/api/conversaciones?tipo=${tipo}`;
    const res = await fetch(url);

    // 🧪 Leer la respuesta como texto para depurar
    const text = await res.text();

    // 🔎 Mostrar la respuesta cruda en consola
    console.log(`🔎 Respuesta cruda desde /api/conversaciones?tipo=${tipo}:`, text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      console.error("❌ Error al parsear JSON:", jsonErr);
      return []; // devolvemos lista vacía si hay error
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

  // 🧠 Intenta usar historialFormateado si el chat está archivado o cerrado
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

  // 🔁 Si no hay historial formateado, cargar desde Firestore
  try {
    const res = await fetch(`${BACKEND_URL}/api/conversaciones/${userId}`);
    const data = await res.json();
    window.__mensajes = data;

    const ordenados = (data || []).sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction));
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

    const mapa = new Map();
    mensajesConEtiqueta.forEach((m) => {
      const clave = m.id || `${m.timestamp}-${m.rol}-${m.tipo}-${m.message}`;
      mapa.set(clave, m);
    });

    const ordenadosFinal = Array.from(mapa.values()).sort(
      (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
    );

    const nuevoLimite = verMas ? limiteMensajes + 25 : limiteMensajes;
    const nuevosVisibles = ordenadosFinal.slice(-nuevoLimite);

    if (verMas) {
      setLimiteMensajes(nuevoLimite);
      setMensajes(ordenadosFinal.slice(-nuevoLimite));
    } else {
      setMensajes(nuevosVisibles);
    }

    setHayMasMensajes(ordenadosFinal.length > nuevosVisibles.length);

    // Actualizar datos del usuario
    let nuevaInfo = todasConversaciones.find((c) => c.userId === userId);

    if (!nuevaInfo) {
      const fallback = await fetch(`${BACKEND_URL}/api/conversaciones?tipo=recientes`);
      const fallbackData = await fallback.json();
      nuevaInfo = fallbackData.find((c) => c.userId === userId) || null;
    }

        // ✅ Solo actualizar si ya hay agente o la conversación no estaba intervenida
    setUsuarioSeleccionado((prev) => {
      if (!prev || !prev.intervenida) {
        return nuevaInfo || null;
      }
      return prev; // no sobreescribas si ya está intervenida
    });

    // ⚠️ Este sí lo puedes actualizar sin problema
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

// ✅ Haz visible la función para poder invocarla desde fuera
window.cargarMensajes = cargarMensajes;

useEffect(() => {
  if (tipoVisualizacion === "archivadas") {
    console.log("📦 Cargando archivadas");
    cargarDatos("archivadas");
    return;
  }

  if (tipoVisualizacion === "recientes") {
    console.log("📡 Cargando recientes con refresco cada 5s");
    cargarDatos("recientes");

    const intervalo = setInterval(() => {
      // Solo refrescar si hay alguna conversación activa o inactiva visible
      const hayActivas = document.querySelector('[data-estado="activa"], [data-estado="inactiva"]');
      if (hayActivas) {
        console.log("🔄 Refrescando porque hay activas/inactivas visibles");
        cargarDatos("recientes");
      } else {
        console.log("🛑 No hay activas/inactivas visibles. No refresco.");
      }
    }, 5000);

    return () => clearInterval(intervalo);
  }
}, [tipoVisualizacion]);

  useEffect(() => {
  const refrescar = () => {
    cargarMensajes(false);
  };

  refrescar(); // ⏱️ se ejecuta al entrar
  const interval = setInterval(refrescar, 5000); // ⏱️ cada 5 segundos

  return () => clearInterval(interval);
}, [userId, limiteMensajes]);

  useEffect(() => {
  if (!userId) return;

  const interval = setInterval(() => {
    const estadoChat = localStorage.getItem('chatEstado');
    if (estadoChat !== "abierto") return; // ⛔ Evita fetch si no está abierto

    fetch(`/api/escribiendo/${userId}`)
      .then((res) => res.json())
      .then((data) => setTextoEscribiendo(data.texto || ""))
      .catch(console.error);
  }, 5000); // ⏱️ reducido a cada 5s

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

// ✅ Nuevo: calcular total de conversaciones no vistas (excepto cerradas)
const totalNoVistos = todasConversaciones.reduce(
  (acc, c) => acc + ((c.noVistos || 0) > 0 && (c.estado || "").toLowerCase() !== "cerrado" ? 1 : 0),
  0
);
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
        fetch(`${BACKEND_URL}/api/liberar-conversacion`, {
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
  onSelect={(id) => {
  if (tipoVisualizacion === "recientes") {
    setSearchParams({ userId: id });
  } else {
    console.log("⛔ No se puede abrir chats nuevos estando en archivadas");
  }
}}
  filtro={filtro}
  setFiltro={setFiltro}
  tipoVisualizacion={tipoVisualizacion}
  setTipoVisualizacion={setTipoVisualizacion}
  paisAToIso={paisAToIso}
  formatearTiempo={formatearTiempo}
  totalNoVistos={totalNoVistos}
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
  todasConversaciones={todasConversaciones} // ✅ Añadido para actualizar correctamente el estado
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
