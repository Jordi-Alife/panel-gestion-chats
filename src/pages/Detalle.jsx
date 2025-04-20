// src/pages/Detalle.jsx
// ... (importaciones y lógica sin cambios)

return (
  <div className="flex flex-col h-screen bg-[#f0f4f8]">
    <div className="flex-1 p-4 gap-4 overflow-hidden flex h-[100vh]">
      
      {/* Columna izquierda */}
      <div className="w-1/5 bg-white rounded-lg shadow-md p-4 overflow-y-auto h-full">
        <h2 className="text-sm text-gray-400 font-semibold mb-2">Conversaciones</h2>
        {listaAgrupada.map((c) => (
          <div
            key={c.userId}
            onClick={() => navigate(`/conversacion/${c.userId}`)}
            className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-100 ${c.userId === userId ? 'bg-blue-50' : ''}`}
          >
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                {c.iniciales}
              </div>
              <div>
                <div className="font-medium text-sm">{c.userId}</div>
                <div className="text-xs text-gray-500">{formatearTiempo(c.lastInteraction)}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ${estadoColor[c.estado]}`}>
                {c.estado}
              </span>
              {c.nuevos > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {c.nuevos}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Columna del centro */}
      <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden h-full">
        <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {mensajes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">No hay mensajes todavía.</p>
          ) : (
            mensajes.map((msg, index) => {
              const isAsistente = msg.from === 'asistente';
              const tieneOriginal = !!msg.original;
              const align = isAsistente ? 'justify-end' : 'justify-start';
              const bubbleColor = isAsistente ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border';

              return (
                <div key={index} className={`flex ${align}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-md ${bubbleColor}`}>
                    {esURLImagen(msg.message) ? (
                      <img
                        src={msg.message}
                        alt="Imagen enviada"
                        className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                    )}
                    {tieneOriginal && (
                      <div className="mt-2 text-[11px] text-right">
                        <button
                          onClick={() => toggleOriginal(index)}
                          className={`underline text-xs ${isAsistente ? 'text-white/70' : 'text-blue-600'} focus:outline-none`}
                        >
                          {originalesVisibles[index] ? "Ocultar original" : "Ver original"}
                        </button>
                        {originalesVisibles[index] && (
                          <p className={`mt-1 italic text-left ${isAsistente ? 'text-white/70' : 'text-gray-500'}`}>
                            {msg.original}
                          </p>
                        )}
                      </div>
                    )}
                    <div className={`text-[10px] mt-1 opacity-60 text-right ${isAsistente ? 'text-white' : 'text-gray-500'}`}>
                      {new Date(msg.lastInteraction).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t flex items-center px-4 py-3 space-x-2"
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
            className="text-sm"
          />
          {imagen && (
            <div className="ml-2 text-xs text-gray-600 flex items-center gap-1">
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
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm hover:bg-blue-700"
          >
            Enviar
          </button>
        </form>
      </div>

      {/* Columna derecha */}
      <div className="w-1/5 bg-white rounded-lg shadow-md p-4 h-full">
        <h2 className="text-sm text-gray-400 font-semibold mb-2">Datos del usuario</h2>
        <p className="text-sm text-gray-700">{userId}</p>
      </div>
    </div>
  </div>
);
}
