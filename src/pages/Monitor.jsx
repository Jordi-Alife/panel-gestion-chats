import { useEffect, useState } from "react";

export default function Monitor() {
  const [estado, setEstado] = useState(null);
  const [openAIUsage, setOpenAIUsage] = useState(null);

  // Solo cargar los datos una vez al entrar
  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then(setEstado)
      .catch((e) => console.error("Error cargando estado:", e));

    fetch("/api/openai-usage")
      .then((res) => res.json())
      .then(setOpenAIUsage)
      .catch((e) => console.error("Error cargando uso OpenAI:", e));
  }, []);

  if (!estado) return <div className="p-6">Cargando estado del sistema...</div>;

  const Tarjeta = ({ titulo, detalle }) => {
    const renderDetalle = () => {
      if (typeof detalle === "string" && detalle.includes("✅")) {
        return (
          <span className="text-[11px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-xl bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 etiqueta-animada">
            ON
          </span>
        );
      }
      if (typeof detalle === "string" && detalle.includes("❌")) {
        return (
          <span className="text-[11px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-xl bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200">
            OFF
          </span>
        );
      }
      return <span>{detalle}</span>;
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-1">{titulo}</h2>
        <div className="text-base font-semibold text-gray-800 dark:text-white">
          {renderDetalle()}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Estado del Sistema</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Tarjeta titulo="Backend" detalle={estado.backend.status} />
        <Tarjeta titulo="Firestore" detalle={estado.firestore} />
        <Tarjeta titulo="OpenAI" detalle={estado.openai} />
        <Tarjeta titulo="Última imagen subida" detalle={estado.lastImageUpload} />
        <Tarjeta titulo="Uptime backend (s)" detalle={Math.floor(estado.backend.uptime)} />
        <Tarjeta titulo="Última actualización" detalle={new Date(estado.backend.timestamp).toLocaleString()} />
        <Tarjeta titulo="SMS Arena" detalle={estado.smsArena || "❌"} />
        {openAIUsage ? (
          <>
            <Tarjeta titulo="OpenAI Límite Total (USD)" detalle={`$${openAIUsage.totalLimit}`} />
            <Tarjeta titulo="OpenAI Gastado (USD)" detalle={`$${openAIUsage.totalUsage}`} />
            <Tarjeta titulo="OpenAI Restante (USD)" detalle={`$${openAIUsage.remaining}`} />
          </>
        ) : (
          <Tarjeta titulo="Uso OpenAI" detalle="Cargando datos..." />
        )}
      </div>
    </div>
  );
}
