// src/components/ModalCrearUsuario.jsx
import React, { useEffect, useState } from "react";
import { invitarUsuario } from "../firebaseAuth";

const ModalCrearUsuario = ({ visible, onClose, onCrear, usuario }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("Administrador");
  const [activo, setActivo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setEmail(usuario.email || "");
      setRol(usuario.rol || "Administrador");
      setActivo(usuario.activo ?? false);
    } else {
      setNombre("");
      setEmail("");
      setRol("Administrador");
      setActivo(false);
    }
  }, [usuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const nuevo = {
      nombre,
      email,
      ultimaConexion: new Date().toISOString(),
      rol,
      activo,
    };

    try {
      if (!usuario && activo) {
        await invitarUsuario(email);
        console.log(`✅ Invitación enviada a ${email}`);
      }
    } catch (err) {
      console.error("❌ Error al invitar usuario:", err);
    }

    setTimeout(() => {
      onCrear(nuevo);
      setGuardando(false);
      onClose();
    }, 500); // Un poco más rápido (opcional)
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4">{usuario ? "Editar agente" : "Crear agente"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              type="text"
              className="w-full border px-4 py-2 rounded"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border px-4 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!usuario}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              className="w-full border px-4 py-2 rounded"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option>Administrador</option>
              <option>Editor</option>
              <option>Soporte</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activo"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="activo" className="text-sm">Activar agente</label>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-4 py-2 rounded bg-[#ff5733] hover:bg-orange-600 text-white text-sm"
            >
              {guardando ? "Guardando..." : usuario ? "Guardar cambios" : "Crear agente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearUsuario;
