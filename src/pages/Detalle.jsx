// src/pages/Detalle.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Detalle() {
  const { userId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/conversaciones/${userId}`)
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

    await fetch('/api/send-to-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message: respuesta })
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] p-4">
      <Link to="/" className="text-blue-600 mb-2">&larr; Volver al panel</Link>
      <h2 className="text-xl font-semibold mb-4">
        Conversación con <span className="text-gray-800">{userId || '(ID no encontrado)'}</span>
      </h2>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-white border rounded"
      >
        {!userId ? (
          <p className="text-red-500">Error: No se pudo obtener el ID del usuario.</p>
        ) : mensajes.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay mensajes todavía.</p>
        ) : (
          mensajes.map((msg, index) => {
            const isAsistente = msg.from === 'asistente';
            return (
              <div
                key={index}
                className={`max-w-[75%] px-4 py-2 rounded-lg text-sm ${
                  isAsistente
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-gray-200 text-gray-900 mr-auto'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <div className="text-[11px] mt-1 text-right opacity-70">
                  {isAsistente ? 'Asistente' : 'Usuario'} — {new Date(msg.lastInteraction).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {userId && (
        <form onSubmit={handleSubmit} className="mt-4 flex border-t pt-4">
          <input
            type="text"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            className="flex-1 border rounded-l px-4 py-2 focus:outline-none"
            placeholder="Escribe tu respuesta..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}
