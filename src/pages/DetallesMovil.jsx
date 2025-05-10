import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DetallesMovil = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    fetch("https://web-production-51989.up.railway.app/api/conversaciones")
      .then((res) => res.json())
      .then((all) => {
        const info = all.find((c) => c.userId === userId);
        setUsuario(info || null);
      });
  }, [userId]);

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

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm mb-2">
        ← Volver
      </button>
      <h1 className="text-lg font-semibold mb-4">Detalles del usuario</h1>

      {/* ✅ BOTÓN CON NUEVO ESTILO */}
      {usuario?.intervenida ? (
        <button
          onClick={async () => {
            try {
              const res = await fetch("https://web-production-51989.up.railway.app/api/liberar-conversacion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: usuario.userId }),
              });
              const data = await res.json();
              if (data.ok) {
                alert("✅ Conversación liberada");
                const updatedRes = await fetch("https://web-production-51989.up.railway.app/api/conversaciones");
                const updatedData = await updatedRes.json();
                const updatedUser = updatedData.find((c) => c.userId === userId);
                setUsuario(updatedUser || null);
              } else {
                alert("⚠️ Error al liberar conversación");
              }
            } catch (error) {
              console.error("❌ Error liberando conversación:", error);
              alert("❌ Error liberando conversación");
            }
          }}
          className="estado-tag estado-activa w-full text-center"
        >
          Liberar conversación
        </button>
      ) : (
        <div className="estado-tag estado-archivado w-full text-center">
          Traspasado a GPT
        </div>
      )}

      {usuario && usuario.intervenidaPor && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-xs text-gray-500 mb-2">Intervenido por</h3>
          <div className="flex items-center gap-2">
            <img
              src={usuario.intervenidaPor.foto || "https://i.pravatar.cc/100?u=default"}
              alt="Agente"
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://i.pravatar.cc/100?u=fallback";
              }}
            />
            <span className="text-sm font-medium">{usuario.intervenidaPor.nombre || "—"}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-sm text-gray-500 mb-2">Datos del usuario</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>ID:</strong> {usuario?.userId || "—"}</p>
          <p><strong>Navegador:</strong> {usuario?.navegador || "—"}</p>
          <p>
            <strong>País:</strong>{" "}
            {paisAToIso(usuario?.pais) ? (
              <img
                src={`https://flagcdn.com/24x18/${paisAToIso(usuario.pais)}.png`}
                alt={usuario.pais}
                className="inline-block ml-1"
              />
            ) : (
              <span className="ml-1">🌐</span>
            )}
          </p>
          <p><strong>Historial:</strong></p>
          <ul className="list-disc list-inside text-xs text-gray-600">
            {(usuario?.historial || []).map((url, idx) => (
              <li key={idx}>{url}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DetallesMovil;
