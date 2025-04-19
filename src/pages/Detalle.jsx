import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Detalle() {
  const { id } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetch(`/api/conversaciones/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log("Datos recibidos del backend:", data);

        const ordenados = data
          .filter(m => m.message) // Solo mensajes válidos
          .sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction))
          .map(msg => ({
            ...msg,
            from: msg.from || (msg.message.startsWith("¡") || msg.message.startsWith("Per ") ? 'asistente' : 'usuario')
          }));

        setMensajes(ordenados);
      });
  }, [id]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [mensajes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!respuesta.trim()) return;

    const nuevoMensaje = {
      userId: id,
      message: respuesta,
      lastInteraction: new Date().toISOString(),
      from: 'asistente'
    };
    setMensajes(prev => [...prev, nuevoMensaje]);
    setRespuesta('');

    await fetch('/api/send-to-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, message: respuesta })
    });
  };

  return (
    <div className="flex flex-col h-screen px-4 py-2">
      <Link to="/" className="text-blue-600 mb-2">&larr; Volver al panel</Link>
      <h2 className="text-xl font-semibold mb-4">Conversación con <span className="text-gray-800">{id}</span></h2>

      <div className="flex flex-col flex-1 overflow-hidden border rounded bg-white">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {mensajes.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay mensajes todavía.</p>
          ) : (
            mensajes.map((msg, i) => {
              const isAsistente = msg.from === 'asistente';
              return (
                <div
                  key={i}
                  className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                    isAsistente
                      ? 'bg-blue-500 text-white self-end ml-auto text-left'
                      : 'bg-gray-200 text-gray-800 self-start mr-auto text-left'
                  }`}
                >
                  <p>{msg.message}</p>
                  <div className="text-xs mt-1 opacity-70 text-right">
                    {isAsistente ? 'Asistente' : 'Usuario'} — {new Date(msg.lastInteraction).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex border-t p-3">
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
      </div>
    </div>
  );
}
