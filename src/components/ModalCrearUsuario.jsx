// src/components/ModalCrearUsuario.jsx
import React, { useState, useEffect } from "react";

const ModalCrearUsuario = ({ visible, onClose, onCrear, modo, usuario }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("Administrador");
  const [activado, setActivado] = useState(false);

  useEffect(() => {
    if (modo === "editar" && usuario) {
      setNombre(usuario.nombre || "");
      setEmail(usuario.email || "");
      setRol(usuario.rol || "Administrador");
      setActivado(usuario.activado || false);
    } else {
      setNombre("");
      setEmail("");
      setRol("Administrador");
      setActivado(false);
    }
  }, [modo, usuario, visible]);

  const handleGuardar = () => {
    if (!nombre.trim() || !email.trim()) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const nuevoUsuario = {
      nombre,
      email,
      rol,
      activado,
      ultimaConexion: new Date().toISOString()
    };

    onCrear(nuevoUsuario);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4 relative">
        <h2 className="text-lg font-bold mb-4">
          {modo === "editar" ? "Editar agente" : "Crear nuevo agente"}
        </h2>

        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="border rounded px-3 py-2 text-sm"
          />

          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="Administrador">Administrador</option>
            <option value="Editor">Editor</option>
            <option value="Soporte">Soporte</option>
          </select>

          <label className="flex items-center gap-2 text-sm mt-2">
            <input
              type="checkbox"
              checked={activado}
              onChange={(e) => setActivado(e.target.checked)}
              className="accent-[#ff5733]"
            />
            Activar agente
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="bg-[#ff5733] hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
          >
            {modo === "editar" ? "Guardar cambios" : "Crear agente"}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ModalCrearUsuario;
