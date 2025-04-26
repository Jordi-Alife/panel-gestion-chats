// src/pages/Perfil.jsx
import React, { useState, useEffect } from "react";

const Perfil = () => {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("Administrador");
  const [foto, setFoto] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const guardado = localStorage.getItem("perfil-usuario-panel");
    if (guardado) {
      const datos = JSON.parse(guardado);
      setNombre(datos.nombre || "");
      setUsuario(datos.usuario || "");
      setEmail(datos.email || "");
      setRol(datos.rol || "Administrador");
      setFoto(datos.foto || "");
    }
  }, []);

  const guardarCambios = () => {
    const perfilActualizado = { nombre, usuario, email, rol, foto };
    localStorage.setItem("perfil-usuario-panel", JSON.stringify(perfilActualizado));

    window.dispatchEvent(new Event("actualizar-foto-perfil")); // << Notificar sidebar
    setMensaje("Cambios guardados correctamente.");
    setTimeout(() => setMensaje(""), 3000);
  };

  const manejarCambioFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onloadend = () => {
        setFoto(lector.result);
      };
      lector.readAsDataURL(archivo);
    }
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
        {/* Foto de perfil */}
        <div className="flex flex-col items-center space-y-2">
          {foto ? (
            <img
              src={foto}
              alt="Foto de perfil"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
              Sin foto
            </div>
          )}
          <label className="cursor-pointer text-blue-600 text-sm underline">
            Cambiar foto
            <input
              type="file"
              accept="image/*"
              onChange={manejarCambioFoto}
              className="hidden"
            />
          </label>
        </div>

        {/* Datos del perfil */}
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

        {/* Botón de guardar */}
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
