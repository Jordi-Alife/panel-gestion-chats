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
  const [alturaPantalla, setAlturaPantalla] = useState(window.innerHeight);
  const chatRef = useRef(null);

  useEffect(() => {
    const actualizarAltura = () => {
      setAlturaPantalla(window.innerHeight);
    };
    window.addEventListener('resize', actualizarAltura);
    return () => window.removeEventListener('resize', actualizarAltura);
  }, []);

  const cargarDatos = () => {
    fetch("https://web-production-51989.up.railway.app/api/conversaciones")
      .then((res) => res.json())
      .then(setTodasConversaciones)
      .catch(console.error);

    fetch("https://web-production-51989.up.railway.app/api/vistas")
      .then((res) => res.json())
      .then(setVistas)
      .catch(console.error);
  };

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(() => {
      cargarDatos();
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarMensajes = () => {
    if (!userId) return;
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then(res => res.json())
      .then(data => {
        const ordenados = data
          .sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction))
          .map(msg => ({
            ...msg,
            from: msg.from || (msg.manual || msg.from === 'asistente' ? 'asistente' : 'usuario')
          }));
        setMensajes(ordenados);
        setTimeout(() => {
          chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: 'auto'
          });
        }, 100);
      });
  };

  useEffect(() => {
    cargarMensajes();
    const interval = setInterval(() => {
      cargarMensajes();
    }, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetch("https://web-production-51989.up.railway.app/api/marcar-visto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    if (imagen) {
      const formData = new FormData();
      formData.append("file", imagen);
      formData.append("userId", userId);

      const response = await fetch("https://web-production-51989.up.railway.app/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      const nuevoMensajeImagen = {
        userId,
        message: data.imageUrl,
        lastInteraction: new Date().toISOString(),
        from: 'asistente'
      };

      setMensajes(prev => [...prev, nuevoMensajeImagen]);
      setImagen(null);
      return;
    }

    if (!respuesta.trim()) return;

    const nuevoMensaje = {
      userId,
      message: respuesta,
      lastInteraction: new Date().toISOString(),
      from: 'asistente'
    };
    setMensajes(prev => [...prev, nuevoMensaje]);
    setRespuesta('');

    await fetch('https://web-production-51989.up.railway.app/api/send-to-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message: respuesta })
    });
  };

  const toggleOriginal = (index) => {
    setOriginalesVisibles(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const esURLImagen = (texto) =>
    typeof texto === 'string' && texto.match(/\.(jpeg|jpg|png|gif|webp)$/i);

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

  const conversacionesPorUsuario = todasConversaciones.reduce((acc, item) => {
    const actual = acc[item.userId] || { mensajes: [] };
    actual.mensajes = [...(actual.mensajes || []), item];
    if (!actual.lastInteraction || new Date(item.lastInteraction) > new Date(actual.lastInteraction)) {
      actual.lastInteraction = item.lastInteraction;
      actual.message = item.message;
    }
    acc[item.userId] = actual;
    return acc;
  }, {});

  const listaAgrupada = Object.entries(conversacionesPorUsuario).map(([id, info]) => {
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

    return {
      userId: id,
      nuevos,
      estado,
      lastInteraction: info.lastInteraction,
      iniciales: id.slice(0, 2).toUpperCase(),
    };
  });

  const estadoColor = {
    Nuevo: "bg-green-500",
    Activo: "bg-blue-500",
    Dormido: "bg-gray-400"
  };

  return (
    <div className="flex flex-col bg-[#f0f4f8]" style={{ height: alturaPantalla }}>
      <div className="flex flex-1 p-4 gap-4 overflow-hidden" style={{ height: alturaPantalla - 64 }}>
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
        <div className="w-1/5 bg-white rounded-lg shadow-md p-4 h-full overflow-y-auto">
          <h2 className="text-sm text-gray-400 font-semibold mb-2">Datos del usuario</h2>
          <p className="text-sm text-gray-700">{userId}</p>
        </div>
      </div>
    </div>
  );
}
