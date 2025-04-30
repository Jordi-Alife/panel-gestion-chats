// src/pages/Conversaciones.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Conversaciones() {
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get("userId") || null;
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [todasConversaciones, setTodasConversaciones] = useState([]);
  const [vistas, setVistas] = useState({});
  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);
  const [filtro, setFiltro] = useState("todas");
  const [agente, setAgente] = useState(null);
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
      .then((res) => res.json())
      .then((data) => {
        const ordenados = (data || []).sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction));
        setMensajes(ordenados);
        setTimeout(() => {
          if (scrollForzado.current && chatRef.current) {
            chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "auto" });
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

  useEffect(() => {
    if (!userId) return;
    const conversacion = todasConversaciones.find(c => c.userId === userId);
    if (conversacion && conversacion.intervenidaPor) {
      setAgente(conversacion.intervenidaPor);
    } else {
      setAgente(null);
    }
  }, [userId, todasConversaciones]);

  const handleScroll = () => {
    const el = chatRef.current;
    if (!el) return;
    const alFinal = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
    scrollForzado.current = alFinal;
    setMostrarScrollBtn(!alFinal);
  };

  const handleScrollBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
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

    const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel"));
    await fetch("https://web-production-51989.up.railway.app/api/send-to-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message: respuesta, agente: perfil })
    });

    setRespuesta("");
  };

  const toggleOriginal = (index) => {
    setOriginalesVisibles(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const esURLImagen = (texto) => typeof texto === "string" && texto.match(/\.(jpeg|jpg|png|gif|webp)$/i);

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
    const actual = acc[item.userId] || { mensajes: [], estado: "abierta" };
    actual.mensajes = [...(actual.mensajes || []), item];
    if (!actual.lastInteraction || new Date(item.lastInteraction) > new Date(actual.lastInteraction)) {
      actual.lastInteraction = item.lastInteraction;
      actual.message = item.message;
      actual.estado = item.estado || "abierta";
    }
    actual.intervenida = item.intervenida;
    actual.intervenidaPor = item.intervenidaPor || null;
    acc[item.userId] = actual;
    return acc;
  }, {});

  const listaAgrupada = Object.entries(conversacionesPorUsuario)
    .map(([id, info]) => {
      const ultimaVista = vistas[id];
      const nuevos = info.mensajes.filter(
        (m) => m.from === "usuario" && (!ultimaVista || new Date(m.lastInteraction) > new Date(ultimaVista))
      ).length;

      const tieneRespuestas = info.mensajes.some(m => m.from === "asistente" || m.manual);
      const ultimoMensaje = [...info.mensajes].reverse()[0];
      const minutosDesdeUltimo = ultimoMensaje ? (Date.now() - new Date(ultimoMensaje.lastInteraction)) / 60000 : Infinity;

      let estado = "Recurrente";
      if (info.estado === "cerrada" || minutosDesdeUltimo > 10) estado = "Cerrado";
      else if (!tieneRespuestas) estado = "Nuevo";
      else if (minutosDesdeUltimo <= 2) estado = "Activo";
      else estado = "Inactivo";

      return {
        userId: id,
        nuevos,
        estado,
        lastInteraction: info.lastInteraction,
        iniciales: id.slice(0, 2).toUpperCase(),
        intervenida: info.intervenida || false,
        intervenidaPor: info.intervenidaPor || null
      };
    })
    .filter((c) => {
      if (filtro === "todas") return true;
      if (filtro === "gpt") return !c.intervenida;
      if (filtro === "humanas") return c.intervenida;
    });

  const estadoColor = {
    Nuevo: "bg-green-500",
    Activo: "bg-blue-500",
    Inactivo: "bg-gray-400",
    Cerrado: "bg-red-500"
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f0f4f8] relative">
      <div className="flex flex-1 p-4 gap-4 overflow-hidden h-[calc(100dvh-5.5rem)]">
        {/* ... Aquí se incluyen las columnas izquierda, central, derecha como en tu versión original ... */}
      </div>

      {/* Componente para enviar conversación por email */}
      <div className="px-4 pb-6">
        <div className="bg-white p-4 mt-4 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Enviar conversación por email</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.email.value;
              if (!email || !userId) return;
              fetch("https://web-production-51989.up.railway.app/api/enviar-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, email, mensajes })
              })
                .then((res) => {
                  if (!res.ok) throw new Error("Error al enviar email");
                  alert("Conversación enviada correctamente");
                  e.target.reset();
                })
                .catch((err) => {
                  console.error(err);
                  alert("Hubo un error al enviar el email");
                });
            }}
            className="flex flex-col sm:flex-row sm:items-center gap-2"
          >
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico del destinatario"
              required
              className="w-full sm:w-auto flex-1 border px-4 py-2 rounded focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
