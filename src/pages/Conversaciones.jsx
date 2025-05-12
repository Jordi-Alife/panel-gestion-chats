import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConversacionList from "../components/ConversacionList";
import ChatPanel from "../components/ChatPanel";
import FormularioRespuesta from "../components/FormularioRespuesta";
import DetallesUsuario from "../components/DetallesUsuario";
import iconVer from "/src/assets/ver.svg";

export default function Conversaciones() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get("userId") || null;

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
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
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

        if (msg.manual && estadoActual === "gpt") {
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
    const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const pasada = new Date(fecha);
    const diffMs = ahora - pasada;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "ahora";
    if (diffMin < 60) return `hace ${diffMin}m`;
    const horas = Math.floor(diffMin / 60);
    if (horas < 24) return `hace ${horas}h`;
    return `hace ${Math.floor(horas / 24)}d`;
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
    <div className="flex flex-row h-screen min-h-screen bg-[#f0f4f8] relative">
      <div className="w-1/5 h-full">
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

      <div className="flex flex-col flex-1 h-full bg-white rounded-lg shadow-md mx-4 my-6 overflow-hidden">
        {/* Cabecera central */}
        {usuarioSeleccionado && (
          <div className="flex justify-between items-center px-6 py-3 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-white">
                {userId.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-800">ID: {userId}</span>
            </div>
            <button onClick={() => setMostrarDetalles((prev) => !prev)} className="w-5 h-5">
              <img src={iconVer} alt="Detalles" className="w-full h-full" />
            </button>
          </div>
        )}

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

      {mostrarDetalles && (
        <div className="w-1/5 h-full">
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
