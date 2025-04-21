// src/pages/Usuarios.jsx
import React, { useEffect, useState } from "react";
import ModalCrearUsuario from "../components/ModalCrearUsuario";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([
    {
      nombre: "Laura Pérez",
      email: "laura@email.com",
      ultimaConexion: "2025-04-20T12:00:00Z",
    },
    {
      nombre: "Carlos Ruiz",
      email: "carlos@email.com",
      ultimaConexion: "2025-04-19T09:30:00Z",
    },
  ]);

  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const handleClick = (e) => {
      const esBotonCrear = e.target.innerText === "Crear usuario";
      if (esBotonCrear) {
        e.preventDefault();
        setMostrarModal(true);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const agregarUsuario = (nuevo) => {
    setUsuarios((prev) => [...prev, nuevo]);
    console.log("Usuario creado:", nuevo);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Gestión de usuarios</h1>

      <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-gray-600 px-2 mb-2">
        <div>Usuario NextLives</div>
        <div>Email</div>
        <div>Última conexión</div>
        <div>Editar</div>
        <div>Eliminar</div>
      </div>

      <div className="grid gap-4">
        {usuarios.map((user, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-4 grid grid-cols-5 gap-4 items-center text-sm"
          >
            <div className="font-medium">{user.nombre}</div>
            <div>{user.email}</div>
            <div>{new Date(user.ultimaConexion).toLocaleDateString()}</div>
            <div>
              <button className="text-blue-600 text-sm hover:underline">
                Editar
              </button>
            </div>
            <div>
              <button className="text-red-500 text-sm hover:underline">
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {usuarios.length === 0 && (
          <p className="text-gray-400 text-center py-6">
            No hay usuarios registrados.
          </p>
        )}
      </div>

      <ModalCrearUsuario
        visible={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onCrear={agregarUsuario}
      />
    </div>
  );
};

export default Usuarios;
