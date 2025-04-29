import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Conversaciones() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [todasConversaciones, setTodasConversaciones] = useState([]);
  const [vistas, setVistas] = useState({});
  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);
  const [filtro, setFiltro] = useState("todas");
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
        const ordenados = (data || []).sort(
          (a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction)
        );
        setMensajes(ordenados);
        setTimeout(() => {
          if (scrollForzado.current && chatRef.current) {
            chatRef.current.scrollTo({
              top: chatRef.current.scrollHeight,
              behavior: "auto",
            });
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
        body: JSON.stringify({ userId }),
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
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
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
        body: formData,
      });

      setImagen(null);
      return;
    }

    if (!respuesta.trim()) return;

    await fetch("https://web-production-51989.up.railway.app/api/send-to-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message: respuesta }),
    });

    setRespuesta("");
  };

  const esURLImagen = (texto) =>
    typeof texto === "string" && texto.match(/\.(jpeg|jpg|png|gif|webp)$/i);

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
    if (
      !actual.lastInteraction ||
      new Date(item.lastInteraction) > new Date(actual.lastInteraction)
    ) {
      actual.lastInteraction = item.lastInteraction;
      actual.message = item.message;
      actual.estado = item.estado || "abierta";
    }
    actual.intervenida = item.intervenida;
    acc[item.userId] = actual;
    return acc;
  }, {});

  const listaAgrupada = Object.entries(conversacionesPorUsuario)
    .map(([id, info]) => {
      const ultimaVista = vistas[id];
      const nuevos = info.mensajes.filter(
        (m) =>
          m.from === "usuario" &&
          (!ultimaVista || new Date(m.lastInteraction) > new Date(ultimaVista))
      ).length;

      const tieneRespuestas = info.mensajes.some(
        (m) => m.from === "asistente" || m.manual
      );
      const ultimoMensaje = [...info.mensajes].reverse()[0];
      const minutosDesdeUltimo = ultimoMensaje
        ? (Date.now() - new Date(ultimoMensaje.lastInteraction)) / 60000
        : Infinity;

      let estado = "Recurrente";

      if (info.estado === "cerrada" || minutosDesdeUltimo > 10) {
        estado = "Cerrado";
      } else if (!tieneRespuestas) {
        estado = "Nuevo";
      } else if (minutosDesdeUltimo <= 2) {
        estado = "Activo";
      } else {
        estado = "Inactivo";
      }

      return {
        userId: id,
        nuevos,
        estado,
        lastInteraction: info.lastInteraction,
        iniciales: id.slice(0, 2).toUpperCase(),
        intervenida: info.intervenida || false,
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
    Cerrado: "bg-red-500",
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f0f4f8] relative">
      <div className="flex flex-1 p-4 gap-4 overflow-hidden h-[calc(100dvh-5.5rem)]">
        {/* Columna izquierda */}
        <div className="w-1/5 bg-white rounded-lg shadow-md p-4 overflow-y-auto h-full">
          <h2 className="text-sm text-gray-400 font-semibold mb-2">Conversaciones</h2>

          <div className="flex gap-2 mb-3">
            {[
              { label: "Todas", value: "todas" },
              { label: "GPT", value: "gpt" },
              { label: "Humanas", value: "humanas" },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFiltro(value)}
                className={`text-xs px-2 py-1 rounded-full border ${
                  filtro === value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {listaAgrupada.map((c) => (
            <div
              key={c.userId}
              onClick={() => navigate(`/conversacion/${c.userId}`)}
              className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-100 ${
                c.userId === userId ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                  {c.iniciales}
                </div>
                <div>
                  <div className="font-medium text-sm">{c.userId}</div>
                  <div className="text-xs text-gray-500">
                    {formatearTiempo(c.lastInteraction)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-[10px] text-white px-2 py-0.5 rounded-full ${estadoColor[c.estado]}`}
                >
                  {c.estado}
                </span>
                {c.nuevos > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {c.nuevos}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Aquí iría la columna de conversación, igual que Detalle.jsx */}
        {/* Si deseas añadirlo completo avísame y lo combinamos */}
      </div>
    </div>
  );
}
