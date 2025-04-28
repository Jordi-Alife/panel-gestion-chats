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
  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);
  const chatRef = useRef(null);
  const scrollForzado = useRef(true);

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
        if (Array.isArray(data)) {
          const ordenados = data
            .sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction))
            .map(msg => ({
              ...msg,
              from: msg.from || 'usuario',
              tipo: msg.tipo || 'texto'
            }));
          setMensajes(ordenados);
        } else {
          setMensajes([]);
        }

        setTimeout(() => {
          if (scrollForzado.current && chatRef.current) {
            chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'auto' });
          }
        }, 100);
      })
      .catch(console.error);
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
    const alFinal = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
    scrollForzado.current = alFinal;
    setMostrarScrollBtn(!alFinal);
  };

  const handleScrollBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
      scrollForzado.current = true;
      setMostrarScrollBtn(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    if (imagen) {
      const formData = new FormData();
      formData.append("file", imagen);
      formData.append("userId", userId);

      await fetch("https://web-production-51989.up.railway.app/api/upload", {
        method: "POST",
        body: formData
      });

      setImagen(null);
      return;
    }

    if (!respuesta.trim()) return;

    await fetch('https://web-production-51989.up.railway.app/api/send-to-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message: respuesta })
    });

    setRespuesta('');
  };

  const esURLImagen = (texto) => typeof texto === 'string' && texto.match(/\.(jpeg|jpg|png|gif|webp)$/i);

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

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f0f4f8]">
      <div className="flex flex-1 p-4 gap-4 overflow-hidden h-[calc(100dvh-5.5rem)]">

        {/* Columna central - Chat */}
        <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden h-full relative">
          <div ref={chatRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 space-y-4 h-0">
            {mensajes.map((msg, index) => {
              const isAsistente = msg.from === 'asistente';
              const bubbleColor = isAsistente ? 'bg-[#ff5733] text-white' : 'bg-white text-gray-800 border';
              const align = isAsistente ? 'justify-end' : 'justify-start';
              return (
                <div key={index} className={`flex ${align}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-md ${bubbleColor}`}>
                    {esURLImagen(msg.message) ? (
                      <img src={msg.message} alt="Imagen" className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain" />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                    )}
                    <div className={`text-[10px] mt-1 opacity-60 text-right ${isAsistente ? 'text-white' : 'text-gray-500'}`}>
                      {new Date(msg.lastInteraction).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {mostrarScrollBtn && (
            <button
              onClick={handleScrollBottom}
              className="absolute bottom-20 right-6 bg-blue-600 text-white px-3 py-1 text-xs rounded-full shadow hover:bg-blue-700"
            >
              Ir al final
            </button>
          )}

          {/* Formulario de enviar mensaje */}
          <form onSubmit={handleSubmit} className="border-t px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
            <label className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 transition">
              Seleccionar archivo
              <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} className="hidden" />
            </label>

            {imagen && (
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <span>{imagen.name}</span>
                <button type="button" onClick={() => setImagen(null)} className="text-red-500 text-xs underline">
                  Quitar
                </button>
              </div>
            )}

            <div className="flex flex-1 gap-2">
              <input
                type="text"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="w-full border rounded-full px-4 py-2 text-sm focus:outline-none"
              />
              <button type="submit" className="bg-[#ff5733] text-white rounded-full px-4 py-2 text-sm hover:bg-orange-600">
                Enviar
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Email - Enviar conversación por correo */}
      <div className="max-w-screen-xl mx-auto w-full px-4 pb-6">
        <div className="bg-white rounded-lg shadow-md p-4 mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm font-medium text-gray-700">
            Enviar conversación por email
          </div>
          <form className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="ejemplo@email.com"
              className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none w-full sm:w-64"
            />
            <button type="submit" className="bg-[#ff5733] text-white rounded-full px-4 py-2 text-sm hover:bg-orange-600">
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
