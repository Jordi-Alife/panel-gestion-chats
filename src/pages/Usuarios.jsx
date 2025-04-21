import React, { useEffect, useState } from "react";

const ModalCrearUsuario = ({ visible, onClose, onCrear, modoEdicion = false, usuario = null }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (modoEdicion && usuario) {
      setNombre(usuario.nombre || "");
      setEmail(usuario.email || "");
    } else {
      setNombre("");
      setEmail("");
    }
  }, [modoEdicion, usuario, visible]);

  const handleGuardar = () => {
    if (!nombre.trim() || !email.trim()) return;
    const nuevoUsuario = {
      nombre,
      email,
      ultimaConexion: new Date().toISOString()
    };
    onCrear(nuevoUsuario);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {modoEdicion ? "Editar usuario" : "Crear nuevo usuario"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleGuardar}
          >
            {modoEdicion ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCrearUsuario;
