// src/pages/Usuarios.jsx
import React, { useEffect, useState } from "react";
import ModalCrearUsuario from "../components/ModalCrearUsuario";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState(() => {
    const guardados = localStorage.getItem("usuarios");
    return guardados ? JSON.parse(guardados) : [];
  });

  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);

  useEffect(() => {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }, [usuarios]);

  const agregarUsuario = (nuevo) => {
    setUsuarios((prev) => [...prev, nuevo]);
    setMostrarModal(false);
  };

  const actualizarUsuario = (actualizado) => {
    const nuevos = usuarios.map((u) =>
      u.email === actualizado.email ? actualizado : u
    );
    setUsuarios(nuevos);
    setMostrarModal(false);
  };

  const eliminarUsuario = (email) => {
    const nuevos = usuarios.filter((u) => u.email !== email);
    setUsuarios(nuevos);
  };

  const abrirEditar = (usuario) => {
    setUsuarioEditar(usuario);
    setMostrarModal(true);
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
              <button
                onClick={() => abrirEditar(user)}
                className="text-blue-600 text-sm hover:underline"
              >
                Editar
              </button>
            </div>
            <div>
              <button
                onClick={() => eliminarUsuario(user.email)}
                className="text-red-500 text-sm hover:underline"
              >
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
        onClose={() => {
          setMostrarModal(false);
          setUsuarioEditar(null);
        }}
        onCrear={agregarUsuario}
        onEditar={actualizarUsuario}
        modo={usuarioEditar ? "editar" : "crear"}
        usuario={usuarioEditar}
      />
    </div>
  );
};

export default Usuarios;
