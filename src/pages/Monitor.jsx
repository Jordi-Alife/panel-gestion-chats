import { useEffect, useState } from "react";

export default function Monitor() {
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    const cargarEstado = () => {
      fetch("/api/status")
        .then((res) => res.json())
        .then(setEstado)
        .catch((e) => console.error("Error cargando estado:", e));
    };
    cargarEstado();
    const intervalo = setInterval(cargarEstado, 10000); // cada 10 segundos
    return () => clearInterval(intervalo);
  }, []);

  if (!estado) return <div className="p-6">Cargando estado del sistema...</div>;

  const Tarjeta = ({ titulo, detalle }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm text-gray-500 mb-1">{titulo}</h2>
      <p className="text-base font-semibold text-gray-800">{detalle}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Estado del Sistema</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Tarjeta titulo="Backend" detalle={`${estado.backend.status} (Puerto: ${estado.backend.port})`} />
        <Tarjeta titulo="Firestore" detalle={estado.firestore} />
        <Tarjeta titulo="OpenAI" detalle={estado.openai} />
        <Tarjeta titulo="Última imagen subida" detalle={estado.lastImageUpload} />
        <Tarjeta titulo="Uptime backend (s)" detalle={Math.floor(estado.backend.uptime)} />
        <Tarjeta titulo="Última actualización" detalle={new Date(estado.backend.timestamp).toLocaleString()} />
      </div>
    </div>
  );
}
