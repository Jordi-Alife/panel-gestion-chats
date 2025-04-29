// src/pages/Conversaciones.jsx
import React, { useEffect, useRef, useState } from 'react';

const Conversaciones = () => {
  const [conversaciones, setConversaciones] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const chatRef = useRef(null);

  const cargarConversaciones = () => {
    fetch('https://web-production-51989.up.railway.app/api/conversaciones')
      .then((res) => res.json())
      .then(setConversaciones)
      .catch(console.error);
  };

  const cargarMensajes = (userId) => {
    fetch(`https://web-production-51989.up.railway.app/api/conversaciones/${userId}`)
      .then(res => res.json())
      .then(data => {
        const ordenados = (data || []).sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction));
        setMensajes(ordenados);
        setTimeout(() => {
          if (chatRef.current) {
            chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'auto' });
          }
        }, 100);
      })
      .catch(console.error);
  };

  useEffect(() => {
    cargarConversaciones();
    const intervalo = setInterval(cargarConversaciones, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const handleSelectConversation = (userId) => {
    setSelectedUserId(userId);
    cargarMensajes(userId);
  };

  const esURLImagen = (texto) => typeof texto === 'string' && texto.match(/\.(jpeg|jpg|png|gif|webp)$/i);

  return (
    <div className="flex h-full">
      {/* Lista de conversaciones */}
      <div className="w-1/4 bg-white overflow-y-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Conversaciones</h2>
        {conversaciones.map((conv, i) => (
          <div
            key={i}
            className={`p-3 cursor-pointer rounded hover:bg-gray-100 ${selectedUserId === conv.userId ? 'bg-gray-200' : ''}`}
            onClick={() => handleSelectConversation(conv.userId)}
          >
            <div className="font-bold text-sm">{conv.userId}</div>
            <div className="text-xs text-gray-500">{conv.estado || 'abierta'}</div>
          </div>
        ))}
      </div>

      {/* Mensajes */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {selectedUserId ? (
          <div className="flex flex-col h-full">
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {mensajes.map((msg, index) => {
                const isAsistente = msg.from === 'asistente';
                const bubbleColor = isAsistente ? 'bg-[#ff5733] text-white' : 'bg-white text-gray-800 border';
                const align = isAsistente ? 'justify-end' : 'justify-start';
                return (
                  <div key={index} className={`flex ${align}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl shadow-md ${bubbleColor}`}>
                      {esURLImagen(msg.message) ? (
                        <img
                          src={msg.message}
                          alt="Imagen"
                          className="rounded-lg max-w-full max-h-[300px] mb-2 object-contain"
                        />
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

            <div className="p-4 border-t">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Selecciona una conversación</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversaciones;
