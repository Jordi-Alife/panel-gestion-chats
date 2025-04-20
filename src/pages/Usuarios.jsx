import React from "react";

const usuariosMock = [
  {
    id: "user01",
    nombre: "Carlos Pérez",
    email: "carlos@nextlives.com",
    ultimaConexion: "2025-04-20T19:30:00Z",
  },
  {
    id: "user02",
    nombre: "Laura García",
    email: "laura@nextlives.com",
    ultimaConexion: "2025-04-20T10:15:00Z",
  },
];

const formatearTiempo = (fecha) => {
  const ahora = new Date();
  const pasada = new Date(fecha);
  const diffMs = ahora - pasada;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffHrs < 24) return `hace ${diffHrs}h`;
  if (diffDays === 1) return "ayer";
  return `hace ${diffDays}d`;
};

export default function Usuarios() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Gestión de usuarios</h1>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-sm font-semibold text-gray-600 px-2 mb-2">
        <div>Usuario NextLives</div>
        <div>Email</div>
        <div>Última conexión</div>
        <div></div>
        <div></div>
      </div>

      <div className="grid gap-4">
        {usuariosMock.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow p-4 grid grid-cols-1 sm:grid-cols-5 gap-4 items-center text-sm"
          >
            <div className="font-medium">{user.nombre}</div>
            <div>{user.email}</div>
            <div>{formatearTiempo(user.ultimaConexion)}</div>
            <div>
              <button className="bg-blue-600 text-white px-3 py-1 text-xs rounded-full hover:bg-blue-700">
                Editar
              </button>
            </div>
            <div>
              <button className="bg-red-500 text-white px-3 py-1 text-xs rounded-full hover:bg-red-600">
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {usuariosMock.length === 0 && (
          <p className="text-gray-400 text-center py-6">
            No hay usuarios registrados.
          </p>
        )}
      </div>
    </div>
  );
}
