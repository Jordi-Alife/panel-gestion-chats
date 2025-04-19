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
        const ordenados = data
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
    setMensajes([...mensajes, nuevoMensaje]);
    setRespuesta('');

    await fetch('/api/send-to-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, message: respuesta })
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4">
        <Link to="/" className="text-blue-600 mb-2 inline-block">&larr; Volver al panel</Link>
        <h2 className="text-xl font-semibold mb-2">Conversación con <span className="text-gray-800">{id}</span></h2>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-2 space-y-2"
        >
          {mensajes.map((msg, i) => {
            const isAsistente = msg.from === 'asistente';
            return (
              <div
                key={i}
                className={`max-w-[75%] p-3 rounded-lg text-sm break-words ${
                  isAsistente
                    ? 'bg-blue-600 text-white self-end ml-auto'
                    : 'bg-gray-200 text-gray-800 self-start mr-auto'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <div className="text-xs mt-1 opacity-70 text-right">
                  {isAsistente ? 'Asistente' : 'Usuario'} — {new Date(msg.lastInteraction).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex p-4 border-t">
          <input
            type="text"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            className="flex-1 border border-gray-300 rounded-l px-4 py-2 focus:outline-none"
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
