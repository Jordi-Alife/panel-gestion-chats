import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Detalle() {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then(res => res.json())
      .then(data => {
        const ordenados = data
          .sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction))
          .map(msg => ({
            ...msg,
            from: msg.from || (msg.message.startsWith("¡") || msg.message.startsWith("Per ") ? 'asistente' : 'usuario')
          }));
        setMensajes(ordenados);
      })
      .catch(err => {
        console.error("Error cargando mensajes:", err);
      });
  }, [userId]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [mensajes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!respuesta.trim() || !userId) return;

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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header estilo WhatsApp */}
      <div className="bg-blue-800 text-white px-4 py-3 shadow flex items-center justify-between">
        <Link to="/" className="text-sm underline">← Volver</Link>
        <h2 className="text-lg font-semibold text-center flex-1">Conversación con {userId}</h2>
        <div className="w-6" />
      </div>

      {/* Chat messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3"
      >
        {mensajes.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">No hay mensajes todavía.</p>
        ) : (
          mensajes.map((msg, index) => {
            const isAsistente = msg.from === 'asistente';
            return (
              <div
                key={index}
                className={`flex ${isAsistente ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md ${
                    isAsistente
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm border'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <div className="text-[10px] mt-1 opacity-60 text-right">
                    {new Date(msg.lastInteraction).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Formulario de respuesta */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border-t flex items-center px-4 py-3"
      >
        <input
          type="text"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 border rounded-full px-4 py-2 mr-2 focus:outline-none text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm hover:bg-blue-700"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
