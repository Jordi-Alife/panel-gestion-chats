// src/pages/Detalle.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Detalle() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [todasConversaciones, setTodasConversaciones] = useState([]);
  const [vistas, setVistas] = useState({});
  const chatRef = useRef(null);
  const [alturaVentana, setAlturaVentana] = useState(window.innerHeight);

  useEffect(() => {
    const actualizarAltura = () => {
      setAlturaVentana(window.innerHeight);
    };
    window.addEventListener('resize', actualizarAltura);
    return () => window.removeEventListener('resize', actualizarAltura);
  }, []);

  // ... [el resto del código no cambia, hasta el return]

  return (
    <div className="flex flex-col bg-[#f0f4f8]" style={{ height: alturaVentana }}>
      <div className="flex flex-1 p-4 gap-4 overflow-hidden grow" style={{ height: alturaVentana }}>
        {/* Columna izquierda */}
        <div className="w-1/5 bg-white rounded-lg shadow-md p-4 overflow-y-auto h-full">
          <h2 className="text-sm text-gray-400 font-semibold mb-2">Conversaciones</h2>
          {Object.entries(todasConversaciones.reduce((acc, item) => {
            const actual = acc[item.userId] || { mensajes: [] };
            actual.mensajes = [...(actual.mensajes || []), item];
            if (!actual.lastInteraction || new Date(item.lastInteraction) > new Date(actual.lastInteraction)) {
              actual.lastInteraction = item.lastInteraction;
              actual.message = item.message;
            }
            acc[item.userId] = actual;
            return acc;
          }, {})).map(([id, info]) => {
            const ultimaVista = vistas[id];
            const nuevos = info.mensajes.filter(
              (m) =>
                m.from === "usuario" &&
                (!ultimaVista || new Date(m.lastInteraction) > new Date(ultimaVista))
            ).length;
            const ultimoUsuario = [...info.mensajes].reverse().find(m => m.from === "usuario");
            const minutosSinResponder = ultimoUsuario
              ? (Date.now() - new Date(ultimoUsuario.lastInteraction)) / 60000
              : Infinity;

            let estado = "Recurrente";
            if (info.mensajes.length === 1) estado = "Nuevo";
            else if (minutosSinResponder < 1) estado = "Activo";
            else estado = "Dormido";

            const estadoColor = {
              Nuevo: "bg-green-500",
              Activo: "bg-blue-500",
              Dormido: "bg-gray-400"
            };

            return (
              <div
                key={id}
                onClick={() => navigate(`/conversacion/${id}`)}
                className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-100 ${id === userId ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                    {id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{id}</div>
                    <div className="text-xs text-gray-500">{new Date(info.lastInteraction).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ${estadoColor[estado]}`}>
                    {estado}
                  </span>
                  {nuevos > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {nuevos}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Columna del centro */}
        <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden h-full">
          <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 h-0">
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
                      {typeof msg.message === 'string' && msg.message.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
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
        <div className="w-1/5 bg-white rounded-lg shadow-md p-4 h-full overflow-y-auto">
          <h2 className="text-sm text-gray-400 font-semibold mb-2">Datos del usuario</h2>
          <p className="text-sm text-gray-700">{userId}</p>
        </div>
      </div>
    </div>
  );
}
