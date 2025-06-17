import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const DetallesMovil = () => {
  const { userId: rawUserId } = useParams();
  const userId = rawUserId?.trim().toLowerCase();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  const cargarUsuarioCompleto = async () => {
  try {
    const tipo = localStorage.getItem("tipoVisualizacion") === "archivadas" ? "archivo" : "recientes";
    const allRes = await fetch(`${BACKEND_URL}/api/conversaciones?tipo=${tipo}`);
    const allData = await allRes.json();

    const info = allData.find(
      (c) => (c.userId || "").trim().toLowerCase() === userId
    );

    if (!info) {
      console.warn("❌ No se encontró la conversación para userId:", userId);
      return;
    }

    // 👉 Obtener más detalles desde /api/conversaciones/:userId
    const detalleRes = await fetch(`${BACKEND_URL}/api/conversaciones/${userId}`);
    const detalleData = await detalleRes.json();

    // 👉 Combinar info general con detalles
    setUsuario({
      ...info,
      ...(Array.isArray(detalleData) ? detalleData[0] : detalleData),
      userId,
    });

    localStorage.setItem("estado-conversacion", info.estado || "abierta");
    localStorage.setItem("intervenida", info.intervenida ? "true" : "false");
  } catch (error) {
    console.error("❌ Error cargando usuario:", error);
  }
};

  useEffect(() => {
    cargarUsuarioCompleto();
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
    <div className="p-4 space-y-4 text-[15px]">
      <button onClick={() => navigate(-1)} className="text-base mb-2">
        ← Volver
      </button>
      <h1 className="text-xl font-semibold mb-4">Detalles del usuario</h1>

      {usuario?.intervenida ? (
        <button
          onClick={async () => {
            try {
              const res = await fetch(`${BACKEND_URL}/api/liberar-conversacion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: usuario.userId }),
              });
              const data = await res.json();
              if (data.ok) {
                alert("✅ Conversación liberada");
                await cargarUsuarioCompleto();
              } else {
                alert("⚠️ Error al liberar conversación");
              }
            } catch (error) {
              console.error("❌ Error liberando conversación:", error);
              alert("❌ Error liberando conversación");
            }
          }}
          className="w-full bg-green-500 hover:bg-green-600 text-white text-base font-semibold py-2.5 rounded-full text-center"
        >
          Liberar conversación
        </button>
      ) : (
        <div className="w-full bg-gray-400 text-white text-base font-semibold py-2.5 rounded-full text-center">
          Traspasado a GPT
        </div>
      )}

      {usuario && usuario.intervenidaPor && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm text-gray-500 mb-2">Intervenido por</h3>
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
            <span className="text-base font-medium">
              {usuario.intervenidaPor.nombre || "—"}
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 text-base">
        <h2 className="text-sm text-gray-500 mb-3">Datos del usuario</h2>
        <div className="text-gray-700 space-y-3">
          <p className="text-sm text-gray-500">ID del usuario</p>
          <div className="bg-gray-100 text-sm px-3 py-1 rounded-md font-semibold text-gray-800">
            {usuario?.userId || "—"}
          </div>

          {usuario?.datosContexto?.user?.name && (
            <>
              <p className="text-sm text-gray-500">Nombre del usuario</p>
              <div className="bg-gray-100 text-sm px-3 py-1 rounded-md font-semibold text-gray-800">
                {usuario.datosContexto.user.name}
              </div>
            </>
          )}

          {usuario?.datosContexto?.line?.name && (
            <>
              <p className="text-sm text-gray-500">Nombre del difunto</p>
              <div className="bg-gray-100 text-sm px-3 py-1 rounded-md font-semibold text-gray-800">
                {usuario.datosContexto.line.name}
              </div>
            </>
          )}

          {usuario?.datosContexto?.line?.company?.name && (
            <>
              <p className="text-sm text-gray-500">Funeraria</p>
              <div className="bg-gray-100 text-sm px-3 py-1 rounded-md font-semibold text-gray-800">
                {usuario.datosContexto.line.company.name}
              </div>
            </>
          )}

          {typeof usuario?.datosContexto?.line?.company?.ecommerce_enabled === "boolean" && (
            <>
              <p className="text-sm text-gray-500">Ecommerce</p>
              <div
                className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                  usuario.datosContexto.line.company.ecommerce_enabled
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {usuario.datosContexto.line.company.ecommerce_enabled ? "ON" : "OFF"}
              </div>
            </>
          )}

          <p className="text-sm text-gray-500">Navegador</p>
          <div className="bg-gray-100 text-sm px-3 py-1 rounded-md text-gray-800 font-semibold">
            {usuario?.navegador || "—"}
          </div>

          <p className="text-sm text-gray-500">País</p>
          <div className="flex items-center gap-2 bg-gray-100 text-sm px-3 py-1 rounded-md font-semibold text-gray-800">
            {paisAToIso(usuario?.pais) ? (
              <img
                src={`https://flagcdn.com/24x18/${paisAToIso(usuario.pais)}.png`}
                alt={usuario.pais}
                className="inline-block"
              />
            ) : (
              <span>🌐</span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-4">Historial</p>
          <ul className="list-disc list-inside text-sm text-gray-600">
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
