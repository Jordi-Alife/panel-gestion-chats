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
  const chatRef = useRef(null);

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
    <div className="flex flex-col h-[100dvh] bg-[#f0f4f8]">
      <div className="flex flex-1 p-4 gap-4 overflow-hidden h-[calc(100dvh-5.5rem)] pb-6">
        {/* El resto del contenido queda igual */}
        {/* ... */}
      </div>
    </div>
  );
}
