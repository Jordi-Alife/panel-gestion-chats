// src/pages/Perfil.jsx
import React, { useState } from "react";

const Perfil = () => {
  const [nombre, setNombre] = useState("Amber Walker");
  const [usuario, setUsuario] = useState("awalker");
  const [email, setEmail] = useState("amber@email.com");
  const [rol, setRol] = useState("Administrador");
  const [mensaje, setMensaje] = useState("");

  const guardarCambios = () => {
    setMensaje("Cambios guardados correctamente.");
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Mi perfil</h1>

      {mensaje && (
        <div className="mb-4 text-green-600 text-sm font-medium">
          {mensaje}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-semibold mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Usuario</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Rol</label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option>Administrador</option>
            <option>Editor</option>
            <option>Soporte</option>
          </select>
        </div>

        <div className="pt-2">
          <button
            onClick={guardarCambios}
            className="bg-[#FF5C42] hover:bg-[#e04c35] text-white px-4 py-2 rounded text-sm"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
