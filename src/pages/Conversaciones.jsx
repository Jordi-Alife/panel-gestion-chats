// Conversaciones.jsx - Versión limpia solo para recientes

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConversacionList from "../componentes/ConversacionList";
import ChatPanel from "../componentes/ChatPanel";
import DetallesUsuario from "../componentes/DetallesUsuario";
import FormularioRespuesta from "../componentes/FormularioRespuesta";
import logoFondo from "/src/assets/logo-nextlives.png";
import { paisAToIso, formatearTiempo } from "../utils/tiempo";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Conversaciones() {
  const [conversaciones, setConversaciones] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [originalesVisibles, setOriginalesVisibles] = useState(false);
  const [chatCerrado, setChatCerrado] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(true);
  const [hayMasMensajes, setHayMasMensajes] = useState(false);
  const [textoEscribiendo, setTextoEscribiendo] = useState("");
  const [agente, setAgente] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const userId = searchParams.get("userId") || null;
  const chatRef = useRef(null);
  const tipoVisualizacion = "recientes";

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/conversaciones?tipo=recientes`)
      .then(res => res.json())
      .then(data => setConversaciones(data));
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`${BACKEND_URL}/api/conversaciones/${userId}`)
      .then(res => res.json())
      .then(data => {
        setMensajes(data.mensajes || []);
        setUsuarioSeleccionado(data.detalle || null);
        setChatCerrado(data.detalle?.estado === "cerrado");
      });
  }, [userId]);

  const cargarMensajes = async () => {
    if (!userId) return;
    const res = await fetch(`${BACKEND_URL}/api/conversaciones/${userId}`);
    const data = await res.json();
    setMensajes(data.mensajes || []);
  };

  const totalNoVistos = conversaciones.reduce(
    (acc, c) => acc + (c.noVistos || 0),
    0
  );

  const listaAgrupada = conversaciones
    .filter(c => c?.estado !== "cerrado")
    .sort((a, b) => (b.ultimoMensaje || 0) - (a.ultimoMensaje || 0));

  const handleCambioVista = () => {
    // Por ahora, sin acción
  };

  return (
    <div className="flex flex-row h-screen bg-[#f0f4f8] dark:bg-gray-950 overflow-hidden">
      {/* Columna izquierda: lista */}
      <div className="w-[22%] h-full overflow-y-auto">
        <ConversacionList
          conversaciones={listaAgrupada}
          userIdActual={userId}
          onSelect={(uid) => setSearchParams({ userId: uid })}
          filtro={filtro}
          setFiltro={setFiltro}
          tipoVisualizacion={tipoVisualizacion}
          paisAToIso={paisAToIso}
          formatearTiempo={formatearTiempo}
          totalNoVistos={totalNoVistos}
          cambiarVista={handleCambioVista}
          pagina="recientes"
        />
      </div>

      {/* Columna central: mensajes */}
      <div className="flex flex-col flex-1 bg-white rounded-lg shadow-md mx-4 overflow-hidden h-full">
        {userId ? (
          <>
            <ChatPanel
              chatRef={chatRef}
              mensajes={mensajes}
              originalesVisibles={originalesVisibles}
              setOriginalesVisibles={setOriginalesVisibles}
              textoEscribiendo={textoEscribiendo}
              userId={userId}
              onScroll={() => {}}
              onToggleDetalles={() => setMostrarDetalles(!mostrarDetalles)}
              onCargarMas={() => cargarMensajes(true)}
              hayMas={hayMasMensajes}
            />
            {!chatCerrado && (
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
            <img src={logoFondo} alt="Logo NextLives" className="w-48 opacity-30" />
          </div>
        )}
      </div>

      {/* Columna derecha: detalles */}
      {mostrarDetalles && (
        <div className="w-1/5 h-full overflow-y-auto">
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
      )}
    </div>
  );
}
