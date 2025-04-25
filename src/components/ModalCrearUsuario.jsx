// src/components/ModalCrearUsuario.jsx
import React, { useState, useEffect } from "react";

const rolesDisponibles = ["Administrador", "Editor", "Soporte"];

const ModalCrearUsuario = ({ visible, onClose, onCrear, usuario }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("Administrador");
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setEmail(usuario.email || "");
      setRol(usuario.rol || "Administrador");
      setActivo(usuario.activo || false);
    } else {
      setNombre("");
      setEmail("");
      setRol("Administrador");
      setActivo(false);
    }
  }, [usuario]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !email) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const nuevo = {
      nombre,
      email,
      ultimaConexion: new Date().toISOString(),
      rol,
      activo,
    };

    onCrear(nuevo);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-6 text-center">
          {usuario ? "Editar agente" : "Crear agente"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring"
              placeholder="Nombre del agente"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring"
              placeholder="Email del agente"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Rol
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring"
            >
              {rolesDisponibles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              id="activo"
              className="accent-[#ff5733]"
            />
            <label htmlFor="activo" className="text-sm text-gray-700">
              Activar agente
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#ff5733] text-white hover:bg-orange-600 text-sm"
            >
              {usuario ? "Guardar cambios" : "Crear agente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearUsuario;
