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
  const [mostrarIrAbajo, setMostrarIrAbajo] = useState(false);
  const chatRef = useRef(null);
  const scrollRef = useRef(null);
  const haHechoScroll = useRef(false);

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

        if (!haHechoScroll.current) {
          setTimeout(() => {
            chatRef.current?.scrollTo({
              top: chatRef.current.scrollHeight,
              behavior: 'auto'
            });
          }, 100);
        }
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
    if (userId && mensajes.length > 0) {
      fetch("https://web-production-51989.up.railway.app/api/marcar-visto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
    }
  }, [mensajes]);

  const handleScroll = () => {
    const el = chatRef.current;
    if (!el) return;
    const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    haHechoScroll.current = true;
    setMostrarIrAbajo(scrollBottom > 200);
  };

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

  const irAbajo = () => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth'
    });
    haHechoScroll.current = false;
    setMostrarIrAbajo(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f0f4f8]">
      <div className="flex flex-1 p-4 gap-4 overflow-hidden h-[calc(100dvh-5.5rem)]">
        {/* ... columna izquierda ... */}

        {/* Columna central */}
        <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden h-full">
          <div
            ref={chatRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-6 space-y-4 h-0 relative"
          >
            {mensajes.map((msg, index) => {
              const isAsistente = msg.from === 'asistente';
              const bubbleColor = isAsistente ? 'bg-[#ff5733] text-white' : 'bg-white text-gray-800 border';
              const align = isAsistente ? 'justify-end' : 'justify-start';

              return (
                <div key={index} className={`flex ${align}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-md ${bubbleColor}`}>
                    {esURLImagen(msg.message) ? (
                      <img src={msg.message} alt="img" className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain" />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                    )}
                    {msg.original && (
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
            })}
            {mostrarIrAbajo && (
              <button
                onClick={irAbajo}
                className="fixed bottom-20 right-10 bg-[#ff5733] text-white px-4 py-2 rounded-full text-xs shadow hover:bg-orange-600"
              >
                ↓ Ir al último
              </button>
            )}
          </div>

          {/* ... input de respuesta ... */}

        </div>

        {/* ... columna derecha ... */}
      </div>

      {/* Campo para enviar conversación por email ... */}
    </div>
  );
}
