import React from "react";

const DetallesUsuario = ({
  usuario,
  agente,
  paisAToIso,
  cargarDatos,
  setUsuarioSeleccionado,
  todasConversaciones
}) => {
  const handleLiberar = async () => {
    try {
      const res = await fetch("https://web-production-51989.up.railway.app/api/liberar-conversacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: usuario.userId }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("✅ Conversación liberada");
        await cargarDatos();
        const actualizada = todasConversaciones.find(c => c.userId === usuario.userId);
        if (actualizada) setUsuarioSeleccionado(actualizada);
      } else {
        alert("⚠️ Error al liberar conversación");
      }
    } catch (error) {
      console.error("❌ Error liberando conversación:", error);
      alert("❌ Error liberando conversación");
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 overflow-y-auto">
      {agente && (
        <div className="mb-4">
          <h3 className="text-xs text-gray-500 dark:text-gray-400">Intervenido por</h3>
          <div className="flex items-center gap-2 mt-1">
            <img
              src={agente.foto || "https://i.pravatar.cc/100?u=default"}
              alt="Agente"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-white">
              {agente.nombre || "—"}
            </span>
          </div>
        </div>
      )}

      {usuario?.intervenida ? (
  <div className="flex items-center gap-2 mt-2">
    <span className="estado-tag estado-activa etiqueta-animada">
      Intervenida
    </span>
    <button
      onClick={handleLiberar}
      className="text-xs text-blue-600 underline hover:text-blue-800 transition duration-200"
    >
      Liberar conversación
    </button>
  </div>
) : (
  <div className="mt-2 bg-gray-400 text-white text-xs px-3 py-1 rounded-full text-center cursor-default">
    Traspasado a GPT
  </div>
)}

      <h2 className="text-sm text-gray-400 dark:text-gray-300 font-semibold mb-2 mt-4">Datos del usuario</h2>
      {usuario ? (
        <div className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
          <p>ID: {usuario.userId}</p>
          <p>Navegador: {usuario.navegador}</p>
          <p>
            País:{" "}
            {paisAToIso(usuario.pais) ? (
              <img
                src={`https://flagcdn.com/24x18/${paisAToIso(usuario.pais)}.png`}
                alt={usuario.pais}
                className="inline-block ml-1"
              />
            ) : (
              <span className="ml-1">🌐</span>
            )}
          </p>
          {usuario.chatCerrado && (
            <p className="text-xs text-red-500 mt-1">⚠ Usuario ha cerrado el chat</p>
          )}
          <p>Historial:</p>
          <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
            {usuario.historial.map((url, idx) => (
              <li key={idx}>{url}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400">Selecciona una conversación</p>
      )}
    </div>
  );
};

export default DetallesUsuario;
