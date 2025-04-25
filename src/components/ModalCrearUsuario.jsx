// src/components/ModalCrearUsuario.jsx
import React, { useState, useEffect } from "react";

const ModalCrearUsuario = ({ isOpen, onClose, onSave, modoEdicion, usuarioEditar }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "Soporte", // Valor por defecto
    activo: false   // Checkbox desmarcado inicialmente
  });

  useEffect(() => {
    if (modoEdicion && usuarioEditar) {
      setFormData({
        nombre: usuarioEditar.nombre || "",
        email: usuarioEditar.email || "",
        rol: usuarioEditar.rol || "Soporte",
        activo: usuarioEditar.activo || false
      });
    } else {
      setFormData({
        nombre: "",
        email: "",
        rol: "Soporte",
        activo: false
      });
    }
  }, [modoEdicion, usuarioEditar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">{modoEdicion ? "Editar agente" : "Crear agente"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
            >
              <option value="Administrador">Administrador</option>
              <option value="Editor">Editor</option>
              <option value="Soporte">Soporte</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="activo" className="text-sm text-gray-700">
              Activar usuario
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#ff5733] text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
            >
              {modoEdicion ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearUsuario;
