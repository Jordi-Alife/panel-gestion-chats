// src/components/ModalCrearUsuario.jsx
import React, { useEffect, useState } from "react";

const ModalCrearUsuario = ({ visible, onClose, onCrear, modo = "crear", usuario = null }) => {
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

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !email) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
    const nuevo = {
      nombre,
      email,
      ultimaConexion: new Date().toISOString(),
      rol,
      activado
    };
    onCrear(nuevo);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-[90%] sm:w-[400px]">
        <h2 className="text-lg font-semibold mb-4 text-center">
          {modo === "editar" ? "Editar agente" : "Crear agente"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mt-1 focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mt-1 focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Rol</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mt-1 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option>Administrador</option>
              <option>Editor</option>
              <option>Soporte</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activado}
              onChange={(e) => setActivado(e.target.checked)}
              id="activo"
            />
            <label htmlFor="activo" className="text-sm">Activado</label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#ff5733] text-white hover:bg-orange-600 transition"
            >
              {modo === "editar" ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearUsuario;
