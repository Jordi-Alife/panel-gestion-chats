import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Detalle() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const [imagen, setImagen] = useState(null);
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
    const intervalo = setInterval(cargarDatos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarMensajes = () => {
    if (!userId) return;
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then(res => res.json())
      .then(data => {
        const ordenados = (data || []).sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction));
        setMensajes(ordenados);
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
    const interval = setInterval(cargarMensajes, 2000);
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

  const conversacionesAgrupadas = todasConversaciones.reduce((acc, item) => {
    const actual = acc[item.userId] || { mensajes: [], lastInteraction: null, estado: "Inactivo" };
    actual.mensajes.push(item);
    if (!actual.lastInteraction || new Date(item.lastInteraction) > new Date(actual.lastInteraction)) {
      actual.lastInteraction = item.lastInteraction;
    }
    acc[item.userId] = actual;
    return acc;
  }, {});

  const listaAgrupada = Object.entries(conversacionesAgrupadas).map(([id, info]) => {
    const ultimaVista = vistas[id];
    const nuevos = info.mensajes.filter(
      (m) => m.from === "usuario" && (!ultimaVista || new Date(m.lastInteraction) > new Date(ultimaVista))
    ).length;
    const ultimoMensaje = [...info.mensajes].reverse()[0];
    const minutosDesdeUltimo = ultimoMensaje
      ? (Date.now() - new Date(ultimoMensaje.lastInteraction)) / 60000
      : Infinity;

    let estado = "Inactivo";
    if (nuevos > 0 && minutosDesdeUltimo < 2) {
      estado = "Activo";
    } else if (nuevos === 0) {
      estado = "Nuevo";
    }

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
    Inactivo: "bg-gray-400"
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1">

        {/* Conversaciones */}
        <div className="w-1/4 bg-white p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Conversaciones</h2>
          {listaAgrupada.map((conv) => (
            <div
              key={conv.userId}
              onClick={() => navigate(`/conversacion/${conv.userId}`)}
              className={`p-2 rounded cursor-pointer flex items-center justify-between ${conv.userId === userId ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              <div>
                <div className="font-bold">{conv.userId}</div>
                <div className="text-xs text-gray-500">{conv.lastInteraction ? new Date(conv.lastInteraction).toLocaleTimeString() : ''}</div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-bold ${estadoColor[conv.estado]} text-white rounded-full px-2 py-0.5`}>{conv.estado}</span>
                {conv.nuevos > 0 && (
                  <span className="text-[10px] bg-red-500 text-white rounded-full px-2 mt-1">{conv.nuevos}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mensajes */}
        <div className="flex-1 flex flex-col bg-gray-50">
          <div ref={chatRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4">
            {mensajes.map((m, idx) => (
              <div key={idx} className={`flex ${m.from === 'asistente' ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`p-2 rounded-lg max-w-xs ${m.from === 'asistente' ? 'bg-orange-500 text-white' : 'bg-white border'}`}>
                  {m.tipo === 'imagen' ? (
                    <img src={m.message} alt="Imagen" className="rounded-lg max-w-full" />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                  )}
                  <div className="text-[10px] text-right mt-1 opacity-70">
                    {new Date(m.lastInteraction).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mostrarScrollBtn && (
            <button onClick={handleScrollBottom} className="absolute bottom-20 right-4 bg-blue-600 text-white p-2 rounded-full">Ir abajo</button>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t flex items-center gap-2">
            <input
              type="file"
              onChange={(e) => setImagen(e.target.files[0])}
              className="hidden"
              id="archivo"
            />
            <label htmlFor="archivo" className="bg-gray-200 px-3 py-2 rounded-full cursor-pointer hover:bg-gray-300">Archivo</label>
            <input
              type="text"
              placeholder="Escribir..."
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              className="flex-1 border rounded-full px-4 py-2 text-sm"
            />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full">Enviar</button>
          </form>
        </div>

      </div>
    </div>
  );
}
