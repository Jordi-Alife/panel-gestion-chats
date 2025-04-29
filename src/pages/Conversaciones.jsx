// src/pages/Conversaciones.jsx
import React, { useEffect, useState } from 'react';

const Conversaciones = () => {
  const [conversaciones, setConversaciones] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    fetch('https://web-production-51989.up.railway.app/api/conversaciones')
      .then((res) => res.json())
      .then(setConversaciones)
      .catch(console.error);
  }, []);

  const handleSelectConversation = async (userId) => {
    setSelectedConversation(userId);
    try {
      const res = await fetch(`https://web-production-51989.up.railway.app/api/mensajes/${userId}`);
      const data = await res.json();
      setMensajes(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full">
      {/* Listado de conversaciones */}
      <div className="w-1/4 bg-white overflow-y-auto">
        <h2 className="text-xl font-semibold p-4">Conversaciones</h2>
        {conversaciones.map((conv) => (
          <div
            key={conv.userId}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedConversation === conv.userId ? 'bg-gray-200' : ''}`}
            onClick={() => handleSelectConversation(conv.userId)}
          >
            <p className="font-bold">{conv.userId}</p>
            <p className="text-xs text-gray-500">{conv.estado}</p>
          </div>
        ))}
      </div>

      {/* Mensajes de conversación */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {selectedConversation ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
              {mensajes.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.from === 'user' ? 'text-left' : 'text-right'}`}>
                  <div className={`inline-block p-2 rounded-lg ${msg.from === 'user' ? 'bg-white' : 'bg-orange-400 text-white'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
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
