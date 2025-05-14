import React from "react";
import { useNavigate } from "react-router-dom";

const PerfilMovil = () => {
  const navigate = useNavigate();
  const perfil = JSON.parse(localStorage.getItem("perfil-usuario-panel") || "{}");

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shadow-sm">
        <button onClick={() => navigate(-1)} className="text-xl">←</button>
        <h1 className="text-lg font-semibold">Mi perfil</h1>
        <div className="w-6 h-6" /> {/* Espacio vacío para centrar */}
      </div>

      {/* Contenido */}
      <div className="p-6 flex flex-col items-center text-center space-y-4">
        <img
          src={perfil.foto || "https://i.pravatar.cc/100"}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full object-cover shadow"
        />
        <h2 className="text-xl font-semibold">{perfil.nombre || "Nombre no disponible"}</h2>
        <p className="text-gray-500">{perfil.email || "Sin email"}</p>
        <p className="text-sm text-gray-400 italic">{perfil.rol || "Sin rol"}</p>

        <button
          className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700"
          onClick={() => alert("Función de edición próximamente")}
        >
          Editar perfil
        </button>
      </div>
    </div>
  );
};

export default PerfilMovil;
