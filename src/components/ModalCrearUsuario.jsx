// src/components/ModalCrearUsuario.jsx
import React, { useState, useEffect } from "react";

const ModalCrearUsuario = ({ visible, onClose, onCrear, usuarioEditar, modoEditar }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("Administrador");
  const [activar, setActivar] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");

  useEffect(() => {
    if (modoEditar && usuarioEditar) {
      setNombre(usuarioEditar.nombre || "");
      setEmail(usuarioEditar.email || "");
      setRol(usuarioEditar.rol || "Administrador");
      setActivar(usuarioEditar.activar || false);
    } else {
      setNombre("");
      setEmail("");
      setRol("Administrador");
      setActivar(false);
    }
  }, [usuarioEditar, modoEditar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    const nuevo = {
      nombre,
      email,
      rol,
      activar,
      ultimaConexion: new Date().toISOString()
    };

    onCrear(nuevo);
    setMensajeConfirmacion(modoEditar ? "Agente actualizado correctamente." : "Agente creado correctamente.");
    setTimeout(() => {
      setMensajeConfirmacion("");
      onClose();
    }, 2000);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4">{modoEditar ? "Editar agente" : "Crear agente"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="border rounded px-3 py-2 w-full text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2 w-full text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="border rounded px-3 py-2 w-full text-sm"
            >
              <option>Administrador</option>
              <option>Editor</option>
              <option>Soporte</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="activar"
              type="checkbox"
              checked={activar}
              onChange={(e) => setActivar(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="activar" className="text-sm text-gray-700">Activar cuenta</label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700"
            >
              {modoEditar ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>

        {mensajeConfirmacion && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded text-sm">
            {mensajeConfirmacion}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalCrearUsuario;
