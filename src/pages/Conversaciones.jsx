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

  return (
    <div className="flex flex-row h-screen min-h-screen bg-[#f0f4f8] relative">
      <div className="w-1/5">
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

      <div className="flex flex-col flex-1 bg-white rounded-lg shadow-md mx-4 my-6 overflow-hidden">
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

      <div className="w-1/5">
        <DetallesUsuario
          usuario={usuarioSeleccionado}
          agente={agente}
          paisAToIso={paisAToIso}
          cargarDatos={cargarDatos}
          setUsuarioSeleccionado={setUsuarioSeleccionado}
          todasConversaciones={todasConversaciones}
        />
      </div>
    </div>
  );
}
