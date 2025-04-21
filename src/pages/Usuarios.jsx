import React, { useState } from "react";
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
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setUsuarioSeleccionado(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioSeleccionado(usuario);
    setMostrarModal(true);
  };

  const guardarUsuario = (usuarioEditado) => {
    if (modoEdicion) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.email === usuarioSeleccionado.email ? usuarioEditado : u
        )
      );
    } else {
      setUsuarios((prev) => [...prev, usuarioEditado]);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Gestión de usuarios</h1>
        <button
          onClick={abrirModalCrear}
          className="bg-[#ff5733] text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Crear usuario
        </button>
      </div>

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
                className="text-blue-600 text-sm hover:underline"
                onClick={() => abrirModalEditar(user)}
              >
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
        onCrear={guardarUsuario}
        modoEdicion={modoEdicion}
        usuario={usuarioSeleccionado}
      />
    </div>
  );
};

export default Usuarios;
