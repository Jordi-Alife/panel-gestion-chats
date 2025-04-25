// src/pages/Perfil.jsx
import React, { useState, useEffect } from "react";

const Perfil = () => {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("Administrador");
  const [foto, setFoto] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Cargar perfil guardado al iniciar
  useEffect(() => {
    const guardado = JSON.parse(localStorage.getItem("perfil-usuario-panel"));
    if (guardado) {
      setNombre(guardado.nombre || "");
      setUsuario(guardado.usuario || "");
      setEmail(guardado.email || "");
      setRol(guardado.rol || "Administrador");
      setFoto(guardado.foto || "");
    } else {
      // Datos por defecto
      setNombre("Amber Walker");
      setUsuario("awalker");
      setEmail("amber@email.com");
      setRol("Administrador");
      setFoto(""); // Sin imagen
    }
  }, []);

  const guardarCambios = () => {
    const datos = { nombre, usuario, email, rol, foto };
    localStorage.setItem("perfil-usuario-panel", JSON.stringify(datos));
    setMensaje("Cambios guardados correctamente.");
    setTimeout(() => setMensaje(""), 3000);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFoto(event.target.result); // Guardamos la imagen en Base64
    };
    reader.readAsDataURL(file);
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
        <div className="flex justify-center">
          <img
            src={foto || "https://i.pravatar.cc/100"}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Cambiar foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="w-full text-sm"
          />
        </div>

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
