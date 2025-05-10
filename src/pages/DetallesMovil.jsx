import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DetallesMovil = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [agente, setAgente] = useState(null);

  const paisAToIso = (paisTexto) => {
    const mapa = {
      Spain: "es",
      France: "fr",
      Italy: "it",
      Mexico: "mx",
      Argentina: "ar",
      Colombia: "co",
      Chile: "cl",
      Peru: "pe",
      "United States": "us",
    };
    return mapa[paisTexto] ? mapa[paisTexto].toLowerCase() : null;
  };

  const cargarDatos = async () => {
    try {
      const res = await fetch("https://web-production-51989.up.railway.app/api/conversaciones");
      const data = await res.json();
      const info = data.find((c) => c.userId === userId);
      setUsuarioSeleccionado(info || null);
      if (info?.intervenidaPor) {
        setAgente(info.intervenidaPor);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [userId]);

  return (
    <div className="flex flex-col h-screen p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-xl">
          ←
        </button>
        <h1 className="text-lg font-semibold">Detalles del usuario</h1>
        <div className="w-6"></div> {/* espacio para alinear */}
      </div>

      {usuarioSeleccionado ? (
        <div className="space-y-4">
          {agente && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm text-gray-500 mb-2">Intervenido por</h3>
              <div className="flex items-center gap-2">
                <img
                  src={agente.foto || "https://i.pravatar.cc/100?u=default"}
                  alt="Agente"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://i.pravatar.cc/100?u=fallback";
                  }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {agente.nombre || "—"}
                </span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm text-gray-500 mb-2">Datos del usuario</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>ID:</strong> {usuarioSeleccionado.userId}</p>
              <p><strong>Navegador:</strong> {usuarioSeleccionado.navegador}</p>
              <p>
                <strong>País:</strong>{" "}
                {paisAToIso(usuarioSeleccionado.pais) ? (
                  <img
                    src={`https://flagcdn.com/24x18/${paisAToIso(usuarioSeleccionado.pais)}.png`}
                    alt={usuarioSeleccionado.pais}
                    className="inline-block ml-1"
                  />
                ) : (
                  <span className="ml-1">🌐</span>
                )}
              </p>
              {usuarioSeleccionado.chatCerrado && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠ Usuario ha cerrado el chat
                </p>
              )}
              <div>
                <strong>Historial:</strong>
                <ul className="list-disc list-inside text-xs text-gray-600">
                  {usuarioSeleccionado.historial.map((url, idx) => (
                    <li key={idx}>{url}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                const res = await fetch("https://web-production-51989.up.railway.app/api/liberar-conversacion", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId: usuarioSeleccionado.userId }),
                });
                const data = await res.json();
                if (data.ok) {
                  alert("✅ Conversación liberada");
                  cargarDatos();
                } else {
                  alert("⚠️ Error al liberar conversación");
                }
              } catch (error) {
                console.error("❌ Error liberando conversación:", error);
                alert("❌ Error liberando conversación");
              }
            }}
            className={`w-full py-2 rounded text-white text-sm ${
              usuarioSeleccionado.intervenida
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!usuarioSeleccionado.intervenida}
          >
            {usuarioSeleccionado.intervenida ? "Liberar conversación" : "Traspasado a GPT"}
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">Cargando datos...</p>
      )}
    </div>
  );
};

export default DetallesMovil;
