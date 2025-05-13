import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import iconVer from "/src/assets/ver.svg";
import iconFile from "/src/assets/file.svg";

const ChatMovil = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);
  const [textoEscribiendo, setTextoEscribiendo] = useState("");
  const [animacionesActivas, setAnimacionesActivas] = useState(false);
  const [estado, setEstado] = useState("");

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const oldestTimestampRef = useRef(null);

  const chatRef = useRef(null);
  const scrollForzado = useRef(true);
  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  useEffect(() => {
    const est = localStorage.getItem(`estado-conversacion-${userId}`);
    if (est) setEstado(est);
  }, [userId]);

  const cargarMensajes = async (desdeTimestamp = null) => {
    try {
      const url = desdeTimestamp
        ? `https://web-production-51989.up.railway.app/api/conversaciones/${userId}?desde=${encodeURIComponent(desdeTimestamp)}`
        : `https://web-production-51989.up.railway.app/api/conversaciones/${userId}`;

      const res = await fetch(url);
      const nuevosMensajes = await res.json();

      if (!nuevosMensajes.length) {
        setHasMore(false);
        return;
      }

      const ordenados = nuevosMensajes.sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction));
      const mensajesConEtiqueta = [];
      let estadoActual = "gpt";

      for (let i = 0; i < ordenados.length; i++) {
        const msg = ordenados[i];

        if (msg.tipo === "estado" && msg.estado === "Traspasado a GPT") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Traspasado a GPT",
            timestamp: msg.lastInteraction,
          });
          estadoActual = "gpt";
        }

        if (msg.tipo === "estado" && msg.estado === "Cerrado") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "El usuario ha cerrado el chat",
            timestamp: msg.lastInteraction,
          });
        }

        if (msg.manual === true && estadoActual === "gpt") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Intervenida",
            timestamp: msg.lastInteraction,
          });
          estadoActual = "humano";
        }

        mensajesConEtiqueta.push(msg);
      }

      setMensajes((prev) => [...mensajesConEtiqueta, ...prev]);

      if (ordenados[0]) {
        oldestTimestampRef.current = ordenados[0].lastInteraction;
      }

      if (!desdeTimestamp) {
        setTimeout(() => {
          if (scrollForzado.current && chatRef.current) {
            chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "auto" });
          }
          setAnimacionesActivas(true);
        }, 100);
      }
    } catch (err) {
      console.error("❌ Error cargando mensajes:", err);
    }
  };
  import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import iconVer from "/src/assets/ver.svg";
import iconFile from "/src/assets/file.svg";

const ChatMovil = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);
  const [textoEscribiendo, setTextoEscribiendo] = useState("");
  const [animacionesActivas, setAnimacionesActivas] = useState(false);
  const [estado, setEstado] = useState("");

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const oldestTimestampRef = useRef(null);

  const chatRef = useRef(null);
  const scrollForzado = useRef(true);
  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  useEffect(() => {
    const est = localStorage.getItem(`estado-conversacion-${userId}`);
    if (est) setEstado(est);
  }, [userId]);

  const cargarMensajes = async (desdeTimestamp = null) => {
    try {
      const url = desdeTimestamp
        ? `https://web-production-51989.up.railway.app/api/conversaciones/${userId}?desde=${encodeURIComponent(desdeTimestamp)}`
        : `https://web-production-51989.up.railway.app/api/conversaciones/${userId}`;

      const res = await fetch(url);
      const nuevosMensajes = await res.json();

      if (!nuevosMensajes.length) {
        setHasMore(false);
        return;
      }

      const ordenados = nuevosMensajes.sort((a, b) => new Date(a.lastInteraction) - new Date(b.lastInteraction));
      const mensajesConEtiqueta = [];
      let estadoActual = "gpt";

      for (let i = 0; i < ordenados.length; i++) {
        const msg = ordenados[i];

        if (msg.tipo === "estado" && msg.estado === "Traspasado a GPT") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Traspasado a GPT",
            timestamp: msg.lastInteraction,
          });
          estadoActual = "gpt";
        }

        if (msg.tipo === "estado" && msg.estado === "Cerrado") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "El usuario ha cerrado el chat",
            timestamp: msg.lastInteraction,
          });
        }

        if (msg.manual === true && estadoActual === "gpt") {
          mensajesConEtiqueta.push({
            tipo: "etiqueta",
            mensaje: "Intervenida",
            timestamp: msg.lastInteraction,
          });
          estadoActual = "humano";
        }

        mensajesConEtiqueta.push(msg);
      }

      setMensajes((prev) => [...mensajesConEtiqueta, ...prev]);

      if (ordenados[0]) {
        oldestTimestampRef.current = ordenados[0].lastInteraction;
      }

      if (!desdeTimestamp) {
        setTimeout(() => {
          if (scrollForzado.current && chatRef.current) {
            chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "auto" });
          }
          setAnimacionesActivas(true);
        }, 100);
      }
    } catch (err) {
      console.error("❌ Error cargando mensajes:", err);
    }
  };

  useEffect(() => {
    if (!estado) return;
    cargarMensajes();
    const interval = setInterval(() => cargarMensajes(), 2000);
    return () => clearInterval(interval);
  }, [userId, estado]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`https://web-production-51989.up.railway.app/api/escribiendo/${userId}`)
        .then((res) => res.json())
        .then((data) => setTextoEscribiendo(data.texto || ""))
        .catch(console.error);
    }, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleScroll = async () => {
    if (!chatRef.current) return;
    const el = chatRef.current;
    const { scrollTop, scrollHeight, clientHeight } = el;

    const cercaDelFinal = scrollTop + clientHeight >= scrollHeight - 100;
    setMostrarScrollBtn(!cercaDelFinal);
    scrollForzado.current = cercaDelFinal;

    if (scrollTop === 0 && hasMore && !loadingMore) {
      setLoadingMore(true);
      await cargarMensajes(oldestTimestampRef.current);
      setLoadingMore(false);
    }
  };
        </form>

      {/* Previsualización de imagen */}
      {imagen && (
        <div className="mt-3 flex items-center gap-3">
          <img
            src={URL.createObjectURL(imagen)}
            alt="Previsualización"
            className="max-h-[100px] rounded-lg border"
          />
          <button
            type="button"
            onClick={() => setImagen(null)}
            className="text-red-500 text-sm underline"
          >
            Quitar imagen
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default ChatMovil;
