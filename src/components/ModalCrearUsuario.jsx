import React, { useEffect, useState } from "react";

const ModalCrearUsuario = ({
  visible,
  onClose,
  onCrear,
  onEditar,
  modo = "crear",
  usuarioEditar = {},
}) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (modo === "editar" && usuarioEditar) {
      setNombre(usuarioEditar.nombre || "");
      setEmail(usuarioEditar.email || "");
    } else {
      setNombre("");
      setEmail("");
    }
  }, [modo, usuarioEditar, visible]);

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const datos = {
      nombre,
      email,
      ultimaConexion: new Date().toISOString(),
    };

    if (modo === "editar") {
      onEditar(datos);
    } else {
      onCrear(datos);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {modo === "editar" ? "Editar usuario" : "Crear nuevo usuario"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Nombre</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Laura Pérez"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Email</label>
            <input
              type="email"
              className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${modo === "editar" ? "bg-gray-100" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej. laura@email.com"
              readOnly={modo === "editar"}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 text-sm text-gray-700 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#FF5C42] text-white text-sm hover:bg-[#e04c35]"
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
