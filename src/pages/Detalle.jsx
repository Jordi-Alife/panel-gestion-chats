// src/pages/Detalle.jsx
// ... (importaciones y lógica sin cambios)

return (
  <div className="flex flex-col bg-[#f0f4f8] h-screen">
    <div className="flex p-4 gap-4 overflow-hidden flex-grow h-full">
      
      {/* Columna izquierda */}
      <div className="w-1/5 bg-white rounded-lg shadow-md p-4 overflow-y-auto h-full">
        {/* ... */}
      </div>

      {/* Columna del centro */}
      <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden h-full">
        <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* ... */}
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
          <textarea
            value={respuesta}
            onChange={(e) => {
              setRespuesta(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none text-sm resize-none overflow-hidden"
            rows={1}
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
        {/* ... */}
      </div>
    </div>
  </div>
);
