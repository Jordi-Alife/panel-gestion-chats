// src/pages/AgenteDetalle.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseAuth";

export default function AgenteDetalle() {
  const { uid } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    // Cargar mensajes
    fetch(`https://web-production-51989.up.railway.app/api/mensajes-agente/${uid}`)
      .then((res) => res.json())
      .then((data) => {
        setMensajes(data || []);
      })
      .catch(console.error);

    // Cargar perfil desde Firestore
    const fetchPerfil = async () => {
      try {
        const db = getFirestore(app);
        const ref = doc(db, "agentes", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setPerfil(snap.data());
        } else {
          console.warn("No existe agente con UID:", uid);
        }
      } catch (error) {
        console.error("❌ Error obteniendo perfil:", error);
      }
    };
    fetchPerfil();
  }, [uid]);

  const mensajesPorDia = mensajes.reduce((acc, msg) => {
    const dia = msg?.timestamp?.split("T")[0];
    if (dia) acc[dia] = (acc[dia] || 0) + 1;
    return acc;
  }, {});

  const datosGrafico = Object.entries(mensajesPorDia).map(([fecha, count]) => ({
    fecha,
    count,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Actividad del Agente</h1>
        <Link
          to="/agentes"
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          Volver a la lista
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={perfil?.foto || "https://i.pravatar.cc/100"}
            alt="Perfil"
            className="w-16 h-16 rounded-full border"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{perfil?.nombre || "Agente desconocido"}</h2>
            <p className="text-sm text-gray-500">{perfil?.email || "Sin email"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-50 rounded p-3 text-center">
            <h3 className="text-xs text-gray-500">Mensajes enviados</h3>
            <p className="text-2xl font-bold text-blue-600">{mensajes.length}</p>
          </div>
          <div className="bg-gray-50 rounded p-3 text-center">
            <h3 className="text-xs text-gray-500">Días activos</h3>
            <p className="text-2xl font-bold text-orange-500">
              {Object.keys(mensajesPorDia).length}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm text-gray-500 mb-2">Mensajes por día</h3>
          <div className="w-full h-60 bg-white">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
